<template>
  <div class="sw-select-result-list">
    <sw-popover
      class="sw-select-result-list-popover"
      :popover-class="popoverClass"
      :z-index="1100"
      :resize-width="popoverResizeWidth"
    >
      <div
        ref="popoverContent"
        class="sw-select-result-list__content"
        :class="{ 'sw-select-result-list__content_empty': isLoading && (!options || options.length <= 0) }"
        @scroll="onScroll"
      >
        <slot name="before-item-list" />

        <ul class="sw-select-result-list__item-list">
          <template v-for="(item, index) in options">
            <slot
              name="result-item"
              v-bind="{ item, index }"
            />
          </template>
        </ul>

        <slot name="after-item-list" />

        <div
          v-if="!isLoading && options && options.length < 1"
          class="sw-select-result-list__empty"
        >
          <sw-icon
            name="default-action-search"
            size="20px"
          />
          {{ emptyMessageText }}
        </div>
      </div>
    </sw-popover>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import SwPopover from '../../../../_internal/sw-popover/sw-popover.vue';
import SwIcon from '../../../../icons-media/sw-icon/sw-icon.vue';

export default Vue.extend({
  name: 'SwSelectResultList',

  i18n: {
    messages: {
      en: {
        'sw-select-result-list': {
          messageNoResults: 'No results found.',
        }
      },
      de: {
        'sw-select-result-list': {
          messageNoResults: 'Es wurden keine Ergebnisse gefunden.',
        }
      }
    },
  },

  components: {
    'sw-popover': SwPopover,
    'sw-icon': SwIcon,
  },

  provide(): { setActiveItemIndex: (index: number) => void} {
    return {
      setActiveItemIndex: this.setActiveItemIndex,
    };
  },

  props: {
    options: {
      type: Array,
      required: false,
      default() {
        return [];
      },
    },

    emptyMessage: {
      type: String,
      required: false,
      default: null,
    },

    focusEl: {
      type: [HTMLDocument, HTMLElement],
      required: false,
      default() { return document; },
    },

    isLoading: {
      type: Boolean,
      required: false,
      default: false,
    },

    popoverClasses: {
      type: Array as PropType<Array<string>>,
      required: false,
      default() {
        return [];
      },
    },

    popoverResizeWidth: {
      type: Boolean,
      required: false,
      default: true,
    },
  },

  data() {
    return {
      activeItemIndex: 0,
    };
  },

  computed: {
    emptyMessageText(): string {

return this.emptyMessage || this.$tc('sw-select-result-list.messageNoResults');
    },

    popoverClass(): Array<string> {
      return [...this.popoverClasses, 'sw-select-result-list-popover-wrapper'];
    },
  },

  created(): void {
    this.addEventListeners();
  },

  mounted(): void {
    // Set first item active
      this.emitActiveItemIndex();
  },

  beforeDestroy(): void {
    this.removeEventListeners();
  },

  methods: {
    setActiveItemIndex(index: number) {
      this.activeItemIndex = index;
      this.emitActiveItemIndex();
    },

    addEventListeners() {
      // @ts-expect-error - property "key" exists on this event
      this.focusEl.addEventListener('keydown', this.navigate);
      document.addEventListener('click', this.checkOutsideClick);
    },

    removeEventListeners() {
      // @ts-expect-error - property "key" exists on this event
      this.focusEl.removeEventListener('keydown', this.navigate);
      document.removeEventListener('click', this.checkOutsideClick);
    },

    emitActiveItemIndex() {
      this.$emit('active-item-change', this.activeItemIndex);
    },

    /**
     *
     * @param event {Event}
     */
    checkOutsideClick(event: MouseEvent) {
      event.stopPropagation();

      // @ts-expect-error - $refs is defined
      const popoverContentClicked = this.$refs.popoverContent.contains(event.target);
      // @ts-expect-error - target exists
      const componentClicked = this.$el.contains(event.target);
      // @ts-expect-error - target exists
      const parentClicked = this.$parent.$el.contains(event.target);

      if (popoverContentClicked || componentClicked || parentClicked) {
        return;
      }

      this.$emit('outside-click');
    },

    navigate({ key }: { key: string }) {
      key = key.toUpperCase();
      if (key === 'ARROWDOWN') {
        this.navigateNext();
        return;
      }

      if (key === 'ARROWUP') {
        this.navigatePrevious();
        return;
      }

      if (key === 'ENTER') {
        this.emitClicked();
      }
    },

    navigateNext() {
      if (this.activeItemIndex >= this.options.length - 1) {
        this.$emit('paginate');
        return;
      }

      this.activeItemIndex += 1;

      this.emitActiveItemIndex();
      this.updateScrollPosition();
    },

    navigatePrevious() {
      if (this.activeItemIndex > 0) {
        this.activeItemIndex -= 1;
      }

      this.emitActiveItemIndex();
      this.updateScrollPosition();
    },

    updateScrollPosition() {
      // wait until the new active item is rendered and has the active class
      this.$nextTick(() => {
        const resultContainer = document.querySelector('.sw-select-result-list__content');
        // @ts-expect-error - resultContainer is defined
        const activeItem = resultContainer.querySelector('.is--active');
        // @ts-expect-error - activeItem is defined
        const itemHeight = activeItem.offsetHeight;
        // @ts-expect-error - activeItem is defined
        const activeItemPosition = activeItem.offsetTop;
        // @ts-expect-error - resultContainer is defined
        const actualScrollTop = resultContainer.scrollTop;

        if (activeItemPosition === 0) {
          return;
        }

        // @ts-expect-error - resultContainer is defined
        // Check if we need to scroll down
        if (resultContainer.offsetHeight + actualScrollTop < activeItemPosition + itemHeight) {
          // @ts-expect-error - resultContainer is defined
          resultContainer.scrollTop += itemHeight;
        }

        // Check if we need to scroll up
        if (actualScrollTop !== 0 && activeItemPosition - actualScrollTop - itemHeight <= 0) {
          // @ts-expect-error - resultContainer is defined
          resultContainer.scrollTop -= itemHeight;
        }
      });
    },

    emitClicked() {
      // This emit is subscribed in the sw-result component. They can for example be disabled and need
      // choose on their own if they are selected
      this.$emit('item-select-by-keyboard', this.activeItemIndex);
    },

    onScroll(event: MouseEvent) {
      // @ts-expect-error - event target is defined
      if (this.getBottomDistance(event.target) !== 0) {
        return;
      }

      this.$emit('paginate');
    },

    getBottomDistance(element: Element) {
      return element.scrollHeight - element.clientHeight - element.scrollTop;
    },
  },
});
</script>

<style lang="scss">
@import "../../../../assets/scss/variables";

$sw-select-result-list-transition: all ease-in-out 0.2s;

.sw-select-result-list,
.sw-select-result-list-popover {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.sw-select-result-list-popover .sw-popover__wrapper {
  width: 100%;
}

.sw-select-result-list__content {
  width: 100%;
  max-height: 250px;
  overflow-x: hidden;
  overflow-y: auto;
  border: 1px solid $color-gray-100;
  box-shadow: 0 3px 6px 0 $color-gray-300;
  background-color: $color-white;
  font-size: $font-size-small;
  font-family: $font-family-default;
  padding: 8px;
  border-radius: 4px;

  .sw-select-result-list__item-list {
    list-style: none;
  }

  .sw-select-result-list__empty {
    padding: 10px 16px;
  }
}

.sw-select-result-list__content_empty {
  opacity: 0;
  min-height: 293px;
  height: 293px;
}

.sw-popover__wrapper.--placement-bottom-outside.sw-select-result-list-popover-wrapper {
  transform: translate(0, calc(-100% - 48px));
}
</style>
