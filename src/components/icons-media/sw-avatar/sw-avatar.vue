<template>
  <span
    ref="swAvatar"
    class="sw-avatar"
    :class="'sw-avatar__' + variant"
    :style="[avatarImage, avatarColor, avatarSize, avatarInitialsSize]"
    role="img"
  >
    <slot>
      <span
        v-if="showInitials"
        class="sw-avatar__initials"
      >
        {{ avatarInitials }}
      </span>
      <span v-if="showPlaceholder">
        <sw-icon name="default-avatar-single" />
      </span>
    </slot>
  </span>
</template>

<script lang="ts">
import cloneDeep from 'lodash-es/cloneDeep';
import Vue from 'vue';

const colors = [
  '#FFD700',
  '#FFC700',
  '#F88962',
  '#F56C46',
  '#FF85C2',
  '#FF68AC',
  '#6AD6F0',
  '#4DC6E9',
  '#A092F0',
  '#8475E9',
  '#57D9A3',
  '#3CCA88',
];

export default Vue.extend({
  name: 'SwAvatar',

  props: {
    color: {
      type: String,
      required: false,
      default: '',
    },
    size: {
      type: String,
      required: false,
      default: null,
    },
    firstName: {
      type: String,
      required: false,
      default: '',
    },
    lastName: {
      type: String,
      required: false,
      default: '',
    },
    imageUrl: {
      type: String,
      required: false,
      default: null,
    },
    placeholder: {
      type: Boolean,
      required: false,
      default: false,
    },
    sourceContext: {
      type: Object,
      required: false,
      default: null,
    },
    variant: {
      type: String,
      required: false,
      default: 'circle',
      validator: (value: string) => ['circle', 'square'].includes(value),
    },
  },

  data() {
    return {
      fontSize: 16,
      lineHeight: 16,
    };
  },

  computed: {
    avatarSize(): {
      width: string,
      height: string,
    } {
      return {
        width: this.size,
        height: this.size,
      };
    },

    avatarInitials(): string {
      const firstNameLetter = this.firstName ? this.firstName[0] : '';
      const lastNameLetter = this.lastName ? this.lastName[0] : '';

      return firstNameLetter + lastNameLetter;
    },

    avatarInitialsSize(): {
      'font-size': string,
      'line-height': string
    } {
      return {
        'font-size': `${this.fontSize}px`,
        'line-height': `${this.lineHeight}px`,
      };
    },

    avatarImage(): {
      'background-image': string,
    } | null {
      if (this.imageUrl) {
        return { 'background-image': `url('${this.imageUrl}')` };
      }

      if (!this.sourceContext || !this.sourceContext.avatarMedia || !this.sourceContext.avatarMedia.url) {
        return null;
      }

      const avatarMedia = cloneDeep(this.sourceContext.avatarMedia);
      // @ts-expect-error - thumbnails exists
      const thumbnailImage = avatarMedia.thumbnails.sort((a, b) => a.width - b.width)[0];
      const previewImageUrl = thumbnailImage ? thumbnailImage.url : avatarMedia.url;

      return { 'background-image': `url('${previewImageUrl}')` };
    },

    avatarColor(): {
      'background-color': string,
    } {
      if (this.color.length) {
        return {
          'background-color': this.color,
        };
      }

      const firstNameLength = this.firstName ? this.firstName.length : 0;
      const lastNameLength = this.lastName ? this.lastName.length : 0;

      const nameLength = firstNameLength + lastNameLength;
      const color = colors[nameLength % colors.length];

      return {
        'background-color': color,
      };
    },

    hasAvatarImage(): boolean {
      return !!this.avatarImage && !!this.avatarImage['background-image'];
    },

    showPlaceholder(): boolean {
      return this.placeholder && !this.hasAvatarImage;
    },

    showInitials(): boolean {
      return !this.placeholder && !this.hasAvatarImage;
    },
  },

  watch: {
    size() {
      this.$nextTick(() => {
        this.generateAvatarInitialsSize();
      });
    },
  },

  mounted() {
    this.mountedComponent();
  },

  methods: {
    mountedComponent() {
      this.generateAvatarInitialsSize();
    },

    generateAvatarInitialsSize() {
      if (!this.$refs.swAvatar) {
        return;
      }

      // @ts-expect-error - offsetHeight exists on element
      const avatarSize = this.$refs.swAvatar.offsetHeight;

      this.fontSize = Math.round(avatarSize * 0.4);
      this.lineHeight = Math.round(avatarSize * 0.98);
    },
  },
});
</script>

<style lang="scss">
@import "../../assets/scss/variables.scss";

$sw-avatar-size-default: 40px;

.sw-avatar {
  display: inline-block;
  width: $sw-avatar-size-default;
  height: $sw-avatar-size-default;
  border-radius: 100%;
  background: $color-gray-200 no-repeat center center;
  background-size: cover;
  text-align: center;
  font-weight: 600;
  text-transform: uppercase;
  color: $color-white;
  user-select: none;

  .sw-icon {
    color: $color-shopware-brand-500;
  }

  &.sw-avatar__square {
    border-radius: 4px;
  }
}
</style>
