import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksHowItWorksStep extends Struct.ComponentSchema {
  collectionName: 'components_blocks_how_it_works_steps';
  info: {
    description: 'A single step in the How It Works process';
    displayName: 'How It Works Step';
    icon: 'chevron-right';
  };
  attributes: {
    description: Schema.Attribute.Text;
    num: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksTextItem extends Struct.ComponentSchema {
  collectionName: 'components_blocks_text_items';
  info: {
    description: 'Reusable item with icon, title and description \u2014 used for Why Us, Values, Objectives';
    displayName: 'Text Item';
    icon: 'list';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'seo';
    icon: 'search';
  };
  attributes: {
    metaDescription: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocks.how-it-works-step': BlocksHowItWorksStep;
      'blocks.text-item': BlocksTextItem;
      'shared.seo': SharedSeo;
    }
  }
}
