import SwIcon from './sw-icon.vue';

export default {
  title: 'Components/Icons & Media/sw-icon',
  component: SwIcon,
  args: {
    name: 'regular-products',
    color: '#3498db',
    multicolor: false,
    decorative: false,
  },
  argTypes: {
    name: {
      control: {
        type: 'text',
      },
    },
    color: {
      control: {
        type: 'color',
      },
    },
    decorative: {
      control: {
        type: 'boolean',
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { SwIcon },
  template: '<sw-icon v-bind="$props"></sw-icon>',
});

export const Default = Template.bind({});
Default.storyName = 'sw-icon';
