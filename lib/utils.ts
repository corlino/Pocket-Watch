import { createCn } from "cn/config";

/**
 * Class merging aware of Pocket Watch's custom theme. Without this, custom
 * font sizes like `text-body` are mistaken for text colours and colour classes
 * such as `text-expense` get dropped.
 */
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [{ text: ["overline", "caption", "body", "body-lg", "h4", "h3", "h2", "h1", "display"] }],
      shadow: [{ shadow: ["card", "float"] }],
    },
  },
});
