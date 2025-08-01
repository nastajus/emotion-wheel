// emotionTreeData.js

export const literalEmotionTree = [
  {
    name: "Joy",
    //baseHue: 60, // pastel yellow
    translations: { fr: "Joie", es: "Alegría" },
    children: [
      {
        name: "Peaceful",
        children: [
          { name: "Content" },
          { name: "Serene" }
        ]
      },
      {
        name: "Excited",
        children: [
          { name: "Eager" },
          { name: "Energetic" }
        ]
      }
    ]
  },
  {
    name: "Trust",
    //baseHue: 120, // pastel green
    children: [
      {
        name: "Affectionate",
        children: [
          { name: "Loving" },
          { name: "Caring" }
        ]
      }
    ]
  },
//   {
//   name: "asdf",
//   //baseHue: 240,  //idk
//   children: [
//     {
//       name: "asdasdf",
//       children: [
//         { name: "235434" },
//         { name: "23423" }
//       ]
//     }
//   ]
//   },
// //   {
// //   name: "asdf",
// //   //baseHue: 300,  //idk
// //   children: [
// //     {
// //       name: "asdasdf",
// //       children: [
// //         { name: "235434" },
// //         { name: "23423" }
// //       ]
// //     }
// //   ]
// //   },
];