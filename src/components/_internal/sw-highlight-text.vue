<script lang="ts">
import Vue, { VNode } from 'vue';

export default Vue.extend({
  name: 'SwHighlightText',

  props: {
    searchTerm: {
      type: String,
      required: false,
      default: null,
    },
    text: {
      type: String,
      required: false,
      default: null,
    },
  },

  methods: {
    searchAndReplace(): string {
      if (!this.text) {
        return '';
      }

      if (!this.searchTerm) {
        return this.text;
      }

      const prefix = '<span class="sw-highlight-text__highlight">';
      const suffix = '</span>';

      const regExp = new RegExp(this.escapeRegExp(this.searchTerm), 'ig');
      return this.text.replace(regExp, (str) => `${prefix}${str}${suffix}`);
    },

    // Remove regex special characters from search string
    escapeRegExp(string: string): string {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    },
  },

  render(createElement): VNode {
    return createElement(
      'div',
      {
        class: 'sw-highlight-text',
        domProps: { innerHTML: this.searchAndReplace() },
      },
    );
  },
});
</script>

<style lang="scss">
@import "../assets/scss/variables.scss";

.sw-highlight-text {
  .sw-highlight-text__highlight {
    color: $color-shopware-brand-500;
    font-weight: bold;
  }
}
</style>
