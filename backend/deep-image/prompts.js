
/**
 * @fileoverview Image generation prompts for creating AI-generated portraits with different themes and genders.
 * 
 * This module combines prompts from different gender-specific files and applies modesty modifications
 * for female prompts, then enhances all prompts with face-centering instructions.
 */

const promptsBoth = require('./prompts-both');
const promptsMale = require('./prompts-male');
const promptsFemale = require('./prompts-female');

// Convert string arrays back to the original format with gender and description
var bothPrompts = promptsBoth.map(description => ({ gender: 'both', description }));
var malePrompts = promptsMale.map(description => ({ gender: 'male', description }));
var femalePrompts = promptsFemale.map(description => ({ gender: 'female', description }));

femalePrompts.forEach((prompt, index) => {
  prompt.description = prompt.description + '. She should be wearing modest clothing, with sleeves and a top that fully covers the chest area, including the collarbone, without any visible cleavage.' 
})

// Combine all prompts into a single array (like the original prompts.json)
var allPrompts = [
  {gender:'both',description:''}, // the original one.
  ...bothPrompts,
  ...malePrompts,
  ...femalePrompts
];

allPrompts.forEach((prompt, index) => {
  prompt.description= 'Make it Accurate. ' + prompt.description + ' The face should be centered so that if the image is later cropped into a circle, the face remains properly aligned. Position the eyes slightly above the horizontal center of the image.'
});

/**
 * Array of image generation prompts with gender information
 * @typedef {Object} PromptObject
 * @property {'male'|'female'|'both'} gender - The target gender for the prompt ('male', 'female', or 'both')
 * @property {string} description - The complete prompt description including modesty and centering instructions
 */

/**
 * All available prompts for image generation
 * @type {PromptObject[]}
 */
module.exports = allPrompts;