<template>
  <sw-base-field
    class="sw-colorpicker"
    :disabled="disabled"
    :required="required"
    :is-inherited="isInherited"
    :is-inheritance-field="isInheritanceField"
    :disable-inheritance-toggle="disableInheritanceToggle"
    :has-focus="hasFocus"
    :help-text="helpText"
    :name="name"
  >
    <template #label>
      {{ label }}
    </template>

    <template #field-prefix>
      <div
        class="sw-colorpicker__previewWrapper"
        role="button"
        :aria-pressed="visible"
        aria-label="colorpicker-toggle"
        @click="toggleColorPicker"
      >
        <div
          class="sw-colorpicker__previewColor"
          :class="{active:visible}"
          :style="{ background: previewColorValue }"
        />
        <div
          class="sw-colorpicker__previewBackground"
          :class="{'is--invalid': !isColorValid}"
        />
      </div>
    </template>

    <template #element>
      <input
        v-model="colorValue"
        aria-label="colorpicker-color-value"
        class="sw-colorpicker__input"
        spellcheck="false"
        :disabled="disabled"
        :readonly="readonly"
        @click="onClickInput"
      >

      <sw-popover
        v-if="visible"
        class="sw-colorpicker__colorpicker-position"
        :z-index="zIndex"
      >
        <div class="sw-colorpicker__colorpicker">
          <div
            ref="colorPicker"
            class="sw-colorpicker__colorpicker-selection"
            :style="{ backgroundColor: selectorBackground }"
            @mousedown="setDragging"
          >
            <div
              class="sw-colorpicker__colorpicker-selector"
              :style="selectorStyles"
            />
          </div>
          <div class="sw-colorpicker__row">
            <div class="sw-colorpicker__sliders">
              <input
                v-model.number="hueValue"
                aria-label="colorpicker-color-range"
                class="sw-colorpicker__colorpicker-slider-range"
                type="range"
                min="0"
                max="360"
                step="1"
              >

              <input
                v-if="alpha"
                v-model.number="alphaValue"
                class="sw-colorpicker__alpha-slider"
                aria-label="colorpicker-alpha-range"
                type="range"
                min="0"
                max="1"
                step="0.01"
                :style="{ backgroundImage: sliderBackground }"
              >
            </div>

            <div
              class="sw-colorpicker__colorpicker-wrapper"
              :class="{ 'is--small': !alpha }"
            >
              <div
                class="sw-colorpicker__colorpicker-previewColor"
                :style="{ background: previewColorValue}"
              />
              <div
                class="sw-colorpicker__colorpicker-previewBackground"
                :class="{ 'is--invalid': !isColorValid }"
              />
            </div>
          </div>

          <div class="sw-colorpicker__row sw-colorpicker__input-row">
            <div class="sw-colorpicker__row-column">
              <input
                v-model.lazy="hexValue"
                class="sw-colorpicker__colorpicker-input is--hex"
                aria-label="hex-value"
                type="text"
                spellcheck="false"
              >
              <label
                v-if="colorLabels"
                class="sw-colorpicker__row-column-label"
              >HEX</label>
            </div>

            <div class="sw-colorpicker__row-column">
              <input
                v-model.number="redValue"
                class="sw-colorpicker__colorpicker-input"
                aria-label="red-value"
                type="number"
                min="0"
                max="255"
                step="1"
                placeholder="0"
              >
              <label
                v-if="colorLabels"
                class="sw-colorpicker__row-column-label"
              >R</label>
            </div>

            <div class="sw-colorpicker__row-column">
              <input
                v-model.number="greenValue"
                class="sw-colorpicker__colorpicker-input"
                aria-label="green-value"
                type="number"
                min="0"
                max="255"
                step="1"
                placeholder="0"
              >
              <label
                v-if="colorLabels"
                class="sw-colorpicker__row-column-label"
              >G</label>
            </div>

            <div class="sw-colorpicker__row-column">
              <input
                v-model.number="blueValue"
                class="sw-colorpicker__colorpicker-input"
                aria-label="blue-value"
                type="number"
                min="0"
                max="255"
                step="1"
                placeholder="0"
              >
              <label
                v-if="colorLabels"
                class="sw-colorpicker__row-column-label"
              >B</label>
            </div>

            <div
              v-if="alpha"
              class="sw-colorpicker__row-column"
            >
              <input
                v-model.number="integerAlpha"
                class="sw-colorpicker__colorpicker-input"
                aria-label="alpha-value"
                type="number"
                min="0"
                max="100"
                step="1"
                placeholder="0"
              >
              <label
                v-if="colorLabels"
                class="sw-colorpicker__row-column-label"
              >Alpha</label>
            </div>
          </div>
        </div>
      </sw-popover>
    </template>

    <template #error>
      <sw-field-error
        v-if="error"
        :error="error"
      />
    </template>
  </sw-base-field>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { debounce } from 'lodash-es';
import SwBaseField from "../_internal/sw-base-field/sw-base-field.vue";
import SwPopover from '../../_internal/sw-popover/sw-popover.vue';

export default Vue.extend({
  name: 'SwColorpicker',

  components: {
    'sw-popover': SwPopover,
    'sw-base-field': SwBaseField,
  },

  props: {
    /**
     * The value of the colorpicker field.
     */
    value: {
      type: String,
      required: false,
      default: '',
    },

    /**
     * A label for your text field. Usually used to guide the user what value this field controls.
     */
    label: {
      type: String,
      required: false,
      default: null,
    },

    /**
     * A text that helps the user to understand what this field does.
     */
    helpText: {
      type: String,
      required: false,
      default: null,
    },

  /**
   * Change the output value which gets emitted and shown in the field.
   * @values auto, hex, hsl, rgb
   */
    colorOutput: {
      type: String as PropType<'auto'|'hex'|'hsl'|'rgb'>,
      required: false,
      default: 'auto',
    },

    /**
     * If activated then the color value can contain alpha values
     */
    alpha: {
      type: Boolean,
      required: false,
      default: true,
    },

    /**
     * Determines if the field is disabled.
     */
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },

    /**
     * Determines if the field is required.
     */
    required: {
      type: Boolean,
      required: false,
      default: false,
    },

    /**
     * Toggles the inheritance visualization.
     */
    isInherited: {
      type: Boolean,
      required: false,
      default: false,
    },

    /**
     * Determines if the field is inheritable.
     */
    isInheritanceField: {
      type: Boolean,
      required: false,
      default: false,
    },

    /**
     * Determines the active state of the inheritance toggle.
     */
    disableInheritanceToggle: {
      type: Boolean,
      required: false,
      default: false,
    },

    /**
     * Determines if the field can be edited
     */
    readonly: {
      type: Boolean,
      required: false,
      default: false,
    },

    /**
     * Toggle the labels above each field inside the colorpicker
     */
    colorLabels: {
      type: Boolean,
      required: false,
      default: true,
    },

    zIndex: {
      type: [Number, null] as PropType<number|null>,
      required: false,
      default: null,
    },

    /**
     * An error in your business logic related to this field.
     *
     * @example {"code": 500, "detail": "Error while saving"}
     */
    error: {
      type: Object,
      required: false,
      default: null,
    },

    /**
     * @ignore
     */
    name: {
      type: String,
      required: false,
      default: null,
    },
  },

  data(): {
    localValue: string|{ string: string; red: string; green: string; blue: string; alpha?: string; },
    visible: boolean,
    isDragging: boolean,
    userInput: null,
    luminanceValue: number,
    saturationValue: number,
    hueValue: number,
    alphaValue: number,
    hasFocus: boolean,
  } {
    return {
      localValue: this.value,
      visible: false,
      isDragging: false,
      userInput: null,
      luminanceValue: 50,
      saturationValue: 50,
      hueValue: 0,
      alphaValue: 1,
      hasFocus: false,
    };
  },

  computed: {
    colorValue: {
      get(): string|{ string: string; red: string; green: string; blue: string; alpha?: string; } {
        return this.localValue;
      },

      set(newColor: { string: string; red: string; green: string; blue: string; alpha?: string; }): void {
        this.localValue = newColor;
        this.debounceEmitColorValue();
      },
    },

    integerAlpha: {
      get(): number {
        return Math.floor(this.alphaValue * 100);
      },

      set(newAlphaValue: number): void {
        this.alphaValue = newAlphaValue / 100;
      },
    },

    sliderBackground(): string {
      // eslint-disable-next-line max-len
      return `linear-gradient(90deg, hsla(${this.hueValue}, ${this.saturationValue}%, ${this.luminanceValue}%, 0), hsl(${this.hueValue}, ${this.saturationValue}%, ${this.luminanceValue}%)), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' width='100%25' height='100%25'%3E%3Crect width='10' height='10' x='00' y='00' fill='%23cdd5db' /%3E%3Crect width='10' height='10' x='10' y='10' fill='%23cdd5db' /%3E%3C/svg%3E")`;
    },

    isColorValid(): boolean {
      if (typeof this.colorValue === 'string') {
        return /^rgb/.test(this.colorValue) || /^hsl/.test(this.colorValue)
        || /^#/.test(this.colorValue);
      }

      return /^rgb/.test(this.colorValue.string) || /^hsl/.test(this.colorValue.string)
        || /^#/.test(this.colorValue.string);
    },

    previewColorValue(): string {
      if (!this.isColorValid) {
        return 'transparent';
      }

      return typeof this.colorValue === 'string' ? this.colorValue : this.colorValue.string;
    },

    selectorBackground(): string {
      return `hsl(${this.hueValue}, 100%, 50%)`;
    },

    redValue: {
      get(): number {
        const value = this.convertHSLtoRGB(
          this.hueValue,
          this.saturationValue,
          this.luminanceValue,
          this.alphaValue,
        );

        if (typeof value !== 'string') {
          return Number(value.red);
        }

        return Number(value);
      },

      set(newRedValue: number): void {
        this.setSingleRGBValue(newRedValue, 'red');
      },
    },

    greenValue: {
      get(): number {
        const value = this.convertHSLtoRGB(
          this.hueValue,
          this.saturationValue,
          this.luminanceValue,
          this.alphaValue,
        );

        if (typeof value !== 'string') {
          return Number(value.green);
        }

        return Number(value);
      },

      set(newGreenValue: number): void {
        this.setSingleRGBValue(newGreenValue, 'green');
      },
    },

    blueValue: {
      get(): number {
        const value = this.convertHSLtoRGB(
          this.hueValue,
          this.saturationValue,
          this.luminanceValue,
          this.alphaValue,
        );

        if (typeof value !== 'string') {
          return Number(value.blue);
        }

        return Number(value);
      },

      set(newBlueValue: number): void {
        this.setSingleRGBValue(newBlueValue, 'blue');
      },
    },

    rgbValue(): string {
      const value = this.convertHSLtoRGB(
        Math.abs(this.hueValue),
        Math.abs(this.saturationValue),
        Math.abs(this.luminanceValue),
        Math.abs(this.alphaValue),
      );

      if (typeof value !== 'string') {
        return value.string;
      }

      return value;
    },

    hslValue(): string {
      const hue = Math.abs(Math.floor(this.hueValue));
      const saturation = Math.abs(Math.floor(this.saturationValue));
      const luminance = Math.abs(Math.floor(this.luminanceValue));

      if (this.alphaValue !== 1) {
        const alpha = Math.abs(Number(this.alphaValue.toFixed(2)));
        return `hsla(${hue}, ${saturation}%, ${luminance}%, ${alpha})`;
      }

      return `hsl(${hue}, ${saturation}%, ${luminance}%)`;
    },

    hexValue: {
      get(): string | {
        string: string;
        red: string;
        green: string;
        blue: string;
        alpha?: string | undefined;
    } {
        if (this.alphaValue < 1) {
          return this.convertHSLtoHEX(
            this.hueValue,
            this.saturationValue,
            this.luminanceValue,
            this.alphaValue,
          );
        }

        return this.convertHSLtoHEX(this.hueValue, this.saturationValue, this.luminanceValue);
      },

      set(newValue: string): void {
        // checking if the new value is an actual hex value
        const newHexValue = newValue;
        const validHexCharacters = /^#[0-9a-f]{3,8}/i;

        if (!validHexCharacters.test(newHexValue)) {
          return;
        }

        const hslValue = this.convertHEXtoHSL(newValue);
        if (hslValue === false) {
          return;
        }

        this.setHslaValues(
          hslValue.hue,
          hslValue.saturation,
          hslValue.luminance,
          hslValue.alpha || this.alphaValue,
        );
      },
    },

    convertedValue(): string|{
      string: string;
      red: string;
      green: string;
      blue: string;
      alpha?: string;
    } {
      switch (this.colorOutput) {
        case 'auto': {
          return this.alphaValue < 1 ? this.rgbValue : this.hexValue;
        }

        case 'rgb': {
          return this.rgbValue;
        }

        case 'hsl': {
          return this.hslValue;
        }

        case 'hex':
        default: {
          return this.hexValue;
        }
      }
    },

    selectorPositionX(): string {
      const offsetX = 9;
      return `calc(${this.saturationValue}% - ${offsetX}px)`;
    },

    selectorPositionY(): string {
      const offsetY = 9;
      return `calc(${Math.abs(this.luminanceValue - 100)}% - ${offsetY}px)`;
    },

    selectorStyles(): {
      backgroundColor: string;
      top: string;
      left: string;
    } {
      return {
        backgroundColor: this.hslValue,
        top: this.selectorPositionY,
        left: this.selectorPositionX,
      };
    },
  },

  watch: {
    value() {
      this.colorValue = this.value;
    },

    hslValue() {
      this.colorValue = this.convertedValue;
    },

    visible(visibleStatus) {
      if (!visibleStatus) {
        return;
      }

      const color = this.colorValue;

      if (/^#/.test(typeof color === 'string' ? color : color.string)) {
        // if color is a hex value
        const convertedHSLValue = this.convertHEXtoHSL(typeof this.colorValue === 'string' ? this.colorValue : this.colorValue.string);

        if (!convertedHSLValue) {
          return;
        }

        this.setHslaValues(
          convertedHSLValue.hue,
          convertedHSLValue.saturation,
          convertedHSLValue.luminance,
          convertedHSLValue.alpha,
        );
      } else if (/^rgb/.test(typeof color === 'string' ? color : color.string)) {
        // if color is a rgb value
        const rgbValues = this.splitRGBValues(typeof this.colorValue === 'string' ? this.colorValue : this.colorValue.string);
        const convertedHSLValue = this.convertRGBtoHSL(rgbValues.red, rgbValues.green, rgbValues.blue);

        this.setHslaValues(
          convertedHSLValue.hue,
          convertedHSLValue.saturation,
          convertedHSLValue.luminance,
          rgbValues.alpha,
        );
      } else if (/^hsl/.test(typeof color === 'string' ? color : color.string)) {
        // if color is an hsl value
        const hslValues = this.splitHSLValues(typeof this.colorValue === 'string' ? this.colorValue : this.colorValue.string);

        this.setHslaValues(
          hslValues.hue,
          hslValues.saturation,
          hslValues.luminance,
          hslValues.alpha,
        );
      }
    },
  },

  beforeDestroy(): void {
    window.removeEventListener('mousedown', this.outsideClick);
  },

  methods: {
    debounceEmitColorValue: debounce(function emitValue() {
      /**
       * Emits the selected color value
       * @property {string} this.colorValue the new color value
       */
      // @ts-expect-error - this context is wrong detected
      this.$emit('input', this.colorValue);
    }, 50),

    outsideClick(e: Event) {
      // @ts-expect-error - target exists
      if (/^sw-colorpicker__previewColor.active/.test(e.target._prevClass)) {
        return;
      }

      // @ts-expect-error - target exists
      const isColorpicker = e.target.closest('.sw-colorpicker__colorpicker');

      if (isColorpicker !== null) {
        return;
      }

      this.visible = false;
      this.removeOutsideClickEvent();
    },

    setOutsideClickEvent() {
      window.addEventListener('mousedown', this.outsideClick);
    },

    removeOutsideClickEvent() {
      window.removeEventListener('mousedown', this.outsideClick);
    },

    toggleColorPicker() {
      if (this.disabled) {
        return;
      }

      this.visible = !this.visible;

      if (this.visible) {
        this.setOutsideClickEvent();

        return;
      }

      this.removeOutsideClickEvent();
    },

    moveSelector(event: MouseEvent) {
      if (!this.isDragging) {
        return;
      }

      // @ts-expect-error - colorPicker exists
      const colorpickerLocation = this.$refs.colorPicker.getBoundingClientRect();
      const cursorX = event.clientX - colorpickerLocation.left;
      const cursorY = event.clientY - colorpickerLocation.top;

      const xValue = (cursorX / colorpickerLocation.width) * 100;
      let correctedXValue;

      if (xValue > 100) {
        correctedXValue = 100;
      } else if (xValue < 0) {
        correctedXValue = 0;
      } else {
        correctedXValue = xValue;
      }

      const yValue = ((cursorY / colorpickerLocation.height) - 1) * -100;
      let correctedYValue;

      if (yValue > 100) {
        correctedYValue = 100;
      } else if (yValue < 0) {
        correctedYValue = 0;
      } else {
        correctedYValue = yValue;
      }

      this.saturationValue = Math.floor(correctedXValue);
      this.luminanceValue = Math.floor(correctedYValue);
    },

    setDragging(event: MouseEvent) {
      document.body.style.userSelect = 'none';
      this.isDragging = true;
      this.moveSelector(event);

      window.addEventListener('mousemove', this.moveSelector, false);
      window.addEventListener('mouseup', this.removeDragging, false);
    },

    removeDragging() {
      // @ts-expect-error - userSelect exists
      document.body.style.userSelect = null;
      this.isDragging = false;

      window.removeEventListener('mousemove', this.moveSelector);
      window.removeEventListener('mouseup', this.removeDragging);
    },

    setSingleRGBValue(newColorValue: number, type: 'red'|'green'|'blue') {
      const validTypes = ['red', 'green', 'blue'];

      if (validTypes.indexOf(type) === -1) {
        return;
      }

      let sanitizedColorValue = null;

      if (newColorValue > 255) {
        sanitizedColorValue = 255;
      } else if (newColorValue < 0) {
        sanitizedColorValue = 0;
      } else {
        sanitizedColorValue = newColorValue;
      }

      const hslValue = this.convertRGBtoHSL(
        type === 'red' ? sanitizedColorValue : this.redValue,
        type === 'green' ? sanitizedColorValue : this.greenValue,
        type === 'blue' ? sanitizedColorValue : this.blueValue,
      );

      this.setHslaValues(hslValue.hue, hslValue.saturation, hslValue.luminance, this.alphaValue);
    },

    setHslaValues(hue: number, saturation: number, luminance: number, alpha?: number) {
      this.hueValue = hue;
      this.luminanceValue = luminance;
      this.saturationValue = saturation;
      this.alphaValue = !alpha ? 1 : alpha;
    },

    splitRGBValues(rgbString: string) {
      const rgbValues = rgbString.slice(rgbString.indexOf('(') + 1, rgbString.length - 1).split(', ');

      const red = Number(rgbValues[0]);
      const green = Number(rgbValues[1]);
      const blue = Number(rgbValues[2]);

      const returnValue: {
        red: number,
        green: number,
        blue: number,
        alpha?: number
      } = {
        red,
        green,
        blue,
      };

      if (/a/.test(rgbString)) {
        returnValue.alpha = Number(rgbValues[3]);
      }

      return returnValue;
    },

    splitHSLValues(hslString: string) {
      const hslValue = hslString.slice(hslString.indexOf('(') + 1, hslString.length - 1).split(', ');

      // Removing the '%' character in string
      const hue = Number(hslValue[0]);
      const saturation = Number(hslValue[1].slice(0, hslValue[1].length - 1));
      const luminance = Number(hslValue[2].slice(0, hslValue[2].length - 1));
      const alpha = hslValue[3] || Number(hslValue[3]) === 0 ? Number(hslValue[3]) : undefined;

      const returnValue: {
        hue: number,
        saturation: number,
        luminance: number,
        alpha?: number
      } = {
        hue,
        saturation,
        luminance,
      };

      if (alpha !== undefined) {
        returnValue.alpha = alpha;
      }

      return returnValue;
    },

    convertHSLtoRGB(
      previousHue: number,
      previousSaturation: number,
      previousLuminance: number,
      previousAlpha: number
    ) {
      const hsla = {
        hue: previousHue,
        saturation: previousSaturation,
        luminance: previousLuminance,
        alpha: previousAlpha,
      };

      return this.convertHSL('rgb', hsla);
    },

    convertHSLtoHEX(
      previousHue: number,
      previousSaturation: number,
      previousLuminance: number,
      previousAlpha?: number
    ): string | {
        string: string;
        red: string;
        green: string;
        blue: string;
        alpha?: string | undefined;
    } {
      const hsla = {
        hue: previousHue,
        saturation: previousSaturation,
        luminance: previousLuminance,
        alpha: previousAlpha,
      };

      return this.convertHSL('hex', hsla);
    },

    convertHSL(
      mode: 'hex'|'rgb',
      color: {
        hue: number,
        saturation: number,
        luminance: number,
        alpha?: number|string
    }): {
      string: string;
      red: string;
      green: string;
      blue: string;
      alpha?: string;
    }|string {
      const validModes = ['hex', 'rgb'];
      if (!validModes.includes(mode)) {
        return {
          string: '',
          red: '',
          green: '',
          blue: '',
        };
      }

      // eslint-disable-next-line prefer-const
      let {
        hue, saturation, luminance, alpha,
      } = color;

      saturation /= 100;
      luminance /= 100;

      const chroma = (1 - Math.abs(2 * luminance - 1)) * saturation;
      const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
      const m = luminance - chroma / 2;
      let red: number|string = 0;
      let green: number|string = 0;
      let blue: number|string = 0;

      if (hue >= 0 && hue < 60) {
        red = chroma; green = x; blue = 0;
      } else if (hue >= 60 && hue < 120) {
        red = x; green = chroma; blue = 0;
      } else if (hue >= 120 && hue < 180) {
        red = 0; green = chroma; blue = x;
      } else if (hue >= 180 && hue < 240) {
        red = 0; green = x; blue = chroma;
      } else if (hue >= 240 && hue < 300) {
        red = x; green = 0; blue = chroma;
      } else if (hue >= 300 && hue < 361) {
        red = chroma; green = 0; blue = x;
      }

      red = Math.round((red + m) * 255);
      green = Math.round((green + m) * 255);
      blue = Math.round((blue + m) * 255);

      if (mode === 'hex') {
        // convert colors into hex values
        red = red.toString(16);
        green = green.toString(16);
        blue = blue.toString(16);

        // Prepend 0s, if necessary
        if (red.length === 1) {
          red = `0${red}`;
        }
        if (green.length === 1) {
          green = `0${green}`;
        }
        if (blue.length === 1) {
          blue = `0${blue}`;
        }

        if (alpha === undefined) {
          return `#${red}${green}${blue}`;
        }

        // @ts-expect-error - alpha cant be converted to number beforehand
        // convert alpha into hex value
        alpha = Math.round(alpha * 255).toString(16);

        if (alpha.length === 1) {
          alpha = `0${alpha}`;
        }

        return `#${red}${green}${blue}${alpha}`;
      }

      const rgbValue: {
        string: string,
        red: string,
        green: string,
        blue: string,
        alpha?: string,
      } = {
        string: `rgb(${red}, ${green}, ${blue})`,
        red: typeof red === 'string' ? red : red.toString(),
        green: typeof green === 'string' ? green : green.toString(),
        blue: typeof blue === 'string' ? blue : blue.toString(),
        alpha: undefined,
      };

      if (alpha !== 1) {
        rgbValue.string = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
        if (typeof alpha === 'string' ) {
          rgbValue.alpha = alpha;
        } else if (alpha !== undefined) {
          rgbValue.alpha = alpha.toString();
        } else {
          rgbValue.alpha = alpha;
        }
      }

      return rgbValue;
    },

    convertRGBtoHSL(previousRed: number, previousGreen: number, previousBlue: number) {
      let red = previousRed;
      let green = previousGreen;
      let blue = previousBlue;

      if (/^-/.test(red.toString())) {
        red = Math.abs(red);
      }

      if (/^-/.test(blue.toString())) {
        blue = Math.abs(blue);
      }

      if (/^-/.test(green.toString())) {
        green = Math.abs(green);
      }

      // Make r, g, and b fractions of 1
      red /= 255;
      green /= 255;
      blue /= 255;

      // Find greatest and smallest channel values
      const cmin = Math.min(red, green, blue);
      const cmax = Math.max(red, green, blue);
      const delta = cmax - cmin;
      let hue = 0;
      let saturation = 0;
      let luminance = 0;

      // Calculate hue
      // No difference
      if (delta === 0) {
        hue = 0;
      } else if (cmax === red) {
        hue = ((green - blue) / delta) % 6;
      } else if (cmax === green) {
        hue = (blue - red) / delta + 2;
      } else {
        hue = (red - green) / delta + 4;
      }

      hue = Math.round(hue * 60);

      // Make negative hues positive behind 360°
      if (hue < 0) {
        hue += 360;
      }

      // Calculate lightness
      luminance = (cmax + cmin) / 2;

      // Calculate saturation
      saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * luminance - 1));

      saturation = +(saturation * 100).toFixed(1);
      luminance = +(luminance * 100).toFixed(1);

      return {
        string: `hsl(${hue},${saturation}%,${luminance}%)`,
        hue,
        saturation,
        luminance,
      };
    },

    convertHEXtoHSL(previousHex: string) {
      const hex = previousHex;

      // Convert hex to RGB first
      let red: number|string = 0;
      let green: number|string = 0;
      let blue: number|string = 0;
      let alpha;

      if (hex.length !== 5 && hex.length !== 9 && hex.length !== 4 && hex.length !== 7) {
        return false;
      }

      // with the first two if statements, check if hex string has an alpha value
      // then check if hex string is short or long
      if (hex.length === 5) {
        red = `0x${hex[1]}${hex[1]}`;
        green = `0x${hex[2]}${hex[2]}`;
        blue = `0x${hex[3]}${hex[3]}`;
        alpha = `0x${hex[4]}${hex[4]}`;
      } else if (hex.length === 9) {
        red = `0x${hex[1]}${hex[2]}`;
        green = `0x${hex[3]}${hex[4]}`;
        blue = `0x${hex[5]}${hex[6]}`;
        alpha = `0x${hex[7]}${hex[8]}`;
      } else if (hex.length === 4) {
        red = `0x${hex[1]}${hex[1]}`;
        green = `0x${hex[2]}${hex[2]}`;
        blue = `0x${hex[3]}${hex[3]}`;
      } else if (hex.length === 7) {
        red = `0x${hex[1]}${hex[2]}`;
        green = `0x${hex[3]}${hex[4]}`;
        blue = `0x${hex[5]}${hex[6]}`;
      }

      // Then to HSL
      // @ts-expect-error - can be calculated
      red /= 255;
      // @ts-expect-error - can be calculated
      green /= 255;
      // @ts-expect-error - can be calculated
      blue /= 255;

      const cmin = Math.min(Number(red), Number(green), Number(blue));
      const cmax = Math.max(Number(red), Number(green), Number(blue));
      const delta = cmax - cmin;

      let hue = 0;
      let saturation = 0;
      let luminance = 0;

      if (delta === 0) {
        hue = 0;
      } else if (cmax === red) {
        hue = ((Number(green) - Number(blue)) / delta) % 6;
      } else if (cmax === green) {
        hue = (Number(blue) - Number(red)) / delta + 2;
      } else {
        hue = (Number(red) - Number(green)) / delta + 4;
      }

      hue = Math.round(hue * 60);

      if (hue < 0) {
        hue += 360;
      }

      luminance = (cmax + cmin) / 2;
      saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * luminance - 1));
      saturation = +(saturation * 100).toFixed(1);
      luminance = +(luminance * 100).toFixed(1);

      const hslValue: {
        string: string,
        hue: number,
        saturation: number,
        luminance: number,
        alpha?: number
      } = {
        string: `hsl(${hue}, ${saturation}%, ${luminance}%)`,
        hue,
        saturation,
        luminance,
        alpha: undefined,
      };

      hslValue.string = `hsla(${hue}, ${saturation}%, ${luminance}, ${alpha}%)`;

      alpha = Number((Number(alpha) / 255).toFixed(2));
      hslValue.alpha = alpha;

      return hslValue;
    },

    onClickInput() {
      if (!this.readonly) {
        return;
      }

      this.toggleColorPicker();
    },

    setFocusClass() {
      this.hasFocus = true;
    },

    removeFocusClass() {
      this.hasFocus = false;
    },
  },
});
</script>

<style lang="scss">
/* stylelint-disable */
@import "../../assets/scss/variables.scss";
@import "../../assets/scss/mixins.scss";

.sw-colorpicker {
  position: relative;

  &__previewWrapper {
    position: relative;
    width: 22px;
    height: 22px;
    border-radius: $border-radius-default;
    overflow: hidden;
    cursor: pointer;
  }

  &__previewColor {
    position: absolute;
    width: 100%;
    height: 100%;
    background: transparent;
  }

  &__previewBackground {
    width: 100%;
    height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 90 90' width='100%25' height='100%25'%3E%3Crect width='30' height='30' x='00' y='00' fill='%23cdd5db' /%3E%3Crect width='30' height='30' x='30' y='30' fill='%23cdd5db' /%3E%3Crect width='30' height='30' x='60' y='00' fill='%23cdd5db' /%3E%3Crect width='30' height='30' x='60' y='60' fill='%23cdd5db' /%3E%3Crect width='30' height='30' x='00' y='60' fill='%23cdd5db' /%3E%3C/svg%3E");

    &.is--invalid::after {
      position: absolute;
      content: '';
      width: 100%;
      height: 100%;
      background-size: contain;
      background-position: left;
      left: 0;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 90 90' width='100%25' height='100%25'%3E%3Cline x1='0' y1='90' x2='90' y2='0' style='stroke:%23DE294C;stroke-width:10' /%3E%3C/svg%3E");
    }
  }

  &__colorpicker-position {
    position: absolute;
    top: calc(100% + 2px);
    left: 0;
    width: 240px;
  }

  &__row {
    display: flex;
    margin-top: 10px;

    &-column {
      display: flex;
      flex-direction: column;
      width: 35px;
      margin-right: 5px;

      &-label {
        text-align: center;
        color: $color-darkgray-200;
        font-size: $font-size-xxs;
        margin-top: 2px;
        user-select: none;
        -moz-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
      }

      &:first-of-type {
        flex: 1;
      }

      &:last-of-type {
        margin-right: 0;
      }
    }
  }

  &__input-row {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  &__sliders {
    flex: 1;
  }

  &__colorpicker {
    width: 260px;
    padding: 10px;
    border: 1px solid $color-gray-300;
    background-color: $color-white;
    border-radius: $border-radius-default;
    box-shadow: 0 3px 6px 0 rgba(120, 138, 155, 0.5);

    &::before {
      content: '';
      position: absolute;
      width: 12px;
      height: 12px;
      top: -6px;
      left: 20px;
      border: 1px solid $color-gray-300;
      border-bottom: none;
      border-right: none;
      background: $color-white;
      transform: rotate(45deg);
    }

    &--compact {
      position: absolute;
      top: 30px;
      left: -20px;
      z-index: 10;

      &::before {
        top: -7px;
      }
    }

    &-selection {
      display: block;
      width: 238px;
      height: 150px;
      border: 1px solid $color-gray-300;
      border-radius: $border-radius-default;
      background-image:
        linear-gradient(180deg, #fff, rgba(255, 255, 255, 0) 50%),
        linear-gradient(0deg, #000, rgba(0, 0, 0, 0) 50%),
        linear-gradient(90deg, #808080, rgba(128, 128, 128, 0) 100%);
    }

    &-selector {
      transform: translate3d(0, 0, 0); // Fixed rendering bug in Safari
      position: relative;
      width: 18px;
      height: 18px;
      border: 3px solid #fff;
      border-radius: 50%;
      box-shadow: 0 0 5px $color-shopware-brand-500;
      cursor: grab;

      &:active {
        cursor: grabbing;
      }
    }

    &-slider-range {
      width: 100%;
      height: 20px;
      border-radius: $border-radius-default;
      background-image: linear-gradient(90deg, #f00 0%, #ff0 16.66%, #0f0 33.33%, #0ff 50%, #00f 66.66%, #f0f 83.33%, #f00 100%);
      outline: none;
      -webkit-appearance: none;
    }

    &-slider-range::-webkit-slider-thumb {
      height: 26px;
      width: 8px;
      border-radius: $border-radius-default;
      border: 1px solid $color-gray-300;
      background: #fff;
      -webkit-appearance: none;
      cursor: pointer;
    }

    &-slider-range::-moz-range-thumb {
      height: 26px;
      width: 8px;
      border-radius: $border-radius-default;
      border: 1px solid $color-gray-300;
      background: #fff;
      cursor: pointer;
    }

    &-wrapper {
      display: flex;
      height: 58px;
      width: 58px;
      margin-left: 10px;
      justify-content: space-between;

      &.is--small {
        width: 22px;
        height: 22px;

        .sw-colorpicker__colorpicker-previewColor {
          width: 22px;
          height: 22px;
          border: none;
        }

        .sw-colorpicker__colorpicker-previewBackground {
          width: 22px;
          height: 22px;
        }
      }
    }

    &-previewColor {
      position: absolute;
      display: inline-block;
      width: 58px;
      height: 58px;
      border: 1px solid $color-gray-300;
      border-radius: $border-radius-default;
      z-index: 1;
    }

    &-previewBackground {
      position: relative;
      display: inline-block;
      width: 58px;
      height: 58px;
      border: 1px solid $color-gray-300;
      border-radius: $border-radius-default;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 90 90' width='100%25' height='100%25'%3E%3Crect width='30' height='30' x='00' y='00' fill='%23cdd5db' /%3E%3Crect width='30' height='30' x='30' y='30' fill='%23cdd5db' /%3E%3Crect width='30' height='30' x='60' y='00' fill='%23cdd5db' /%3E%3Crect width='30' height='30' x='60' y='60' fill='%23cdd5db' /%3E%3Crect width='30' height='30' x='00' y='60' fill='%23cdd5db' /%3E%3C/svg%3E");

      &.is--invalid::after {
        position: absolute;
        content: '';
        width: 100%;
        height: 100%;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 90 90' width='100%25' height='100%25'%3E%3Cline x1='0' y1='90' x2='90' y2='0' style='stroke:%23DE294C;stroke-width:10' /%3E%3C/svg%3E");
        background-size: contain;
        background-position: left;
      }
    }

    &-input {
      width: 100%;
      min-width: 0;
      height: 32px;
      padding: 0 5px;
      border: 1px solid $color-gray-300;
      border-radius: $border-radius-default;
      font-size: $font-size-xxs;
      font-family: $font-family-default;
      color: $color-darkgray-200;
      outline: none;

      &[type=number] {
        -moz-appearance: textfield;
      }

      &[type=number]::-webkit-inner-spin-button,
      &[type=number]::-webkit-outer-spin-button {
        -webkit-appearance: none;
      }

      &:last-of-type {
        margin-right: 0;
      }

      &.is--hex {
        flex: 1;
      }

      &:focus {
        border-color: $color-shopware-brand-500;
      }
    }
  }

  &__alpha-slider {
    width: 100%;
    height: 20px;
    margin-top: 10px;
    border: 1px solid $color-gray-300;
    border-radius: $border-radius-default;
    background-image: url("data:image/svg+xml, %3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' width='100%25' height='100%25'%3E%3Crect width='10' height='10' x='00' y='00' fill='%23cdd5db' /%3E%3Crect width='10' height='10' x='10' y='10' fill='%23cdd5db' /%3E%3C/svg%3E");
    outline: none;
    -webkit-appearance: none;

    &::-webkit-slider-thumb {
      height: 26px;
      width: 8px;
      border-radius: $border-radius-default;
      border: 1px solid $color-gray-300;
      background: #fff;
      -webkit-appearance: none;
      cursor: pointer;
    }

    &::-moz-range-thumb {
      height: 26px;
      width: 8px;
      border: 1px solid $color-gray-300;
      border-radius: $border-radius-default;
      background: #fff;
      cursor: pointer;
    }
  }

  .is--disabled &__previewWrapper {
    cursor: default;
  }
}

.sw-field__addition {
  position: relative;
  padding: 0;
}

.sw-field__addition.is--prefix {
  display: flex;
  justify-content: center;
  align-items: center;
}

.sw-field__addition .sw-colorpicker__trigger {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.sw-field__addition .sw-colorpicker__trigger .sw-icon {
  line-height: 16px;
}

.sw-popover__wrapper {
  &.--placement-bottom-outside {
    .sw-colorpicker__colorpicker::before {
      top: calc(100% - 7px);
      transform: rotate(225deg);
    }
  }
}
/* stylelint-enable */
</style>
