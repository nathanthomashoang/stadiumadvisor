const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

// sanitize HTML (security)
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {}
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
})

const Joi = BaseJoi.extend(extension)

module.exports.stadiumSchema = Joi.object({
    stadium: Joi.object({
        title: Joi.string().required().escapeHTML(),
        location: Joi.string().required().escapeHTML(),
        capacity: Joi.number().required().min(0).max(200000),
        team: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML().max(750),
        // images: Joi.string().required()
    }).required(),
    deleteImgs: Joi.array()
}).required()

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required()
    }).required()
}).required()