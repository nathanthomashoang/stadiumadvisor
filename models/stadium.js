const mongoose = require('mongoose');
const { Schema } = mongoose;
// paginate v-2
const mongoosePaginate = require('mongoose-paginate-v2');
// require models
const Review = require('./review');
const User = require('./user');

const imageSchema = new Schema({
    url: String,
    filename: String
});

imageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('upload','upload/w_150,h_150,c_fill');
});

imageSchema.virtual('clusterThumbnail').get(function() {
    return this.url.replace('upload','upload/w_100');
});

const opts = { toJSON: { virtuals:true }};

const stadiumSchema = new Schema({
    title: String,
    location: String,
    capacity: Number,
    team: String,
    description: String,
    images: [imageSchema],
    reviewCount: Number,
    avgRating: Number,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, opts)

stadiumSchema.virtual('properties.popUpContent').get(function () {
    // properties.popUpMarkup (we're nesting popUpMarkup under "properties")
    return `
    <img class="w-100" src="${this.images[0].clusterThumbnail}">
    <br>
    <strong><a href="/stadia/${this._id}">${this.title}</a></strong>
    <br>
    ${this.location}`;
});

stadiumSchema.post('findOneAndDelete', async function (stadium) {
    if (stadium) {
        await Review.deleteMany({
            _id: {
                $in: stadium.reviews
            }
        })
    }
})

stadiumSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Stadium',stadiumSchema);