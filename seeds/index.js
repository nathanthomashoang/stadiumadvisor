const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors, places, teams } = require('./seedHelpers')
const Stadium = require('../models/stadium');
const Review = require('../models/review');

mongoose.connect('mongodb://localhost:27017/stadiumadvisor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})
.then(() => {
    console.log('MongoDB Connected!')
})
.catch(err => {
    console.log('MONGO connection error!')
    console.log(err)
})

// function to pick a random descriptor/place from the seedHelpers arrays
const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)]
};

// function to seed MongoDB database
const seedDB = async() => {
    // delete everything in Stadium database
    await Stadium.deleteMany();
    // delete all in Reviews database
    await Review.deleteMany();
    // reseed
    for (let i = 0; i < 150; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const capacity = Math.floor(Math.random() * 70142) + 30000;
        const cityName = cities[random1000].city
        const location =`${cityName}, ${cities[random1000].state}`;
        const stadium = new Stadium({
            title: `${sample(descriptors)} ${sample(places)}`,
            location: location,
            geometry: {
                type: 'Point',
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            capacity: capacity,
            reviewCount: 0,
            avgRating: 0,
            team: `${cityName} ${sample(teams)}`,
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel mi ac enim malesuada semper. Nam pulvinar fermentum leo id molestie. Maecenas fermentum ut erat non lacinia. Pellentesque condimentum nibh ligula.',
            images: [{
                url: 'https://res.cloudinary.com/deogbhozj/image/upload/v1625691364/stadium-advisor/photo-1545849094-340bcab0eadf_arwb6o.jpg'
            }],
            owner: '60de019ffb99fa01720af770'
        })
        await stadium.save();
    }
}

// execute
seedDB();
