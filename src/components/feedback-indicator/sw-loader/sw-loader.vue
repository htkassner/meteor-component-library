<template>
  <div class="sw-loader">
    <div
      class="sw-loader__container"
      :style="loaderSize"
    >
      <div class="sw-loader-element">
        <div :style="{ borderWidth: borderWidth }" />
        <div :style="{ borderWidth: borderWidth }" />
        <div :style="{ borderWidth: borderWidth }" />
        <div :style="{ borderWidth: borderWidth }" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'SwLoader',

  props: {
    /**
     * Define the size of the loader. Should be a string containing "${yourNumber}px"
     */
    size: {
      type: String,
      required: false,
      default: '50px',
      validator(value: string) {
        return value.endsWith('px');
      },
    },
  },

  computed: {
    loaderSize(): {
      width: string,
      height: string,
    } {
      return {
        width: `${this.numericSize}px`,
        height: `${this.numericSize}px`,
      };
    },
    numericSize(): number {
      const numericSize = parseInt(this.size, 10);

      if (Number.isNaN(numericSize)) {
        return 50;
      }

      return numericSize;
    },

    borderWidth(): string {
      const borderWith = Number(this.numericSize / 12).toPrecision(2);

      return `${borderWith}px`;
    },
  },
});
</script>

<style lang="scss">
@import "../../assets/scss/variables.scss";

$sw-loader-color-overlay: rgba(255, 255, 255, 0.8);
$sw-loader-element-color: $color-shopware-brand-500;
$sw-loader-rotate-duration: 1.4s;
$sw-loader-z-index: $z-index-loader;

.sw-loader {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  z-index: $sw-loader-z-index;
  background: $sw-loader-color-overlay;

  .sw-loader__container {
    display: grid;
    grid-auto-columns: auto;
    text-align: center;
    position: relative;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .sw-loader-element {
    div {
      position: absolute;
      width: 100%;
      height: 100%;
      border-width: 4px;
      border-style: solid;
      border-radius: 50%;
      border-color: $sw-loader-element-color transparent transparent transparent;
      animation: sw-loader-rotator $sw-loader-rotate-duration cubic-bezier(0.5, 0, 0.5, 1) infinite;

      &:nth-child(1) {
        animation-delay: -0.45s;
      }

      &:nth-child(2) {
        animation-delay: -0.3s;
      }

      &:nth-child(3) {
        animation-delay: -0.15s;
      }
    }
  }

  @keyframes sw-loader-rotator {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
