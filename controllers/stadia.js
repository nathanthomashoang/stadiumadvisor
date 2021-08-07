// requiring model
const Stadium = require('../models/stadium');

// cloudinary
const { cloudinary } = require('../cloudinary');
// mapbox
const mbxGeocoder = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
geocoder = mbxGeocoder({ accessToken: mapBoxToken});

// index route
module.exports.index = async (req, res) => {
    const { sort, page } = req.query;
// Sort filters
    const filters = {
        asc: {
            title: 'asc'
        },
        desc: {
            title: 'desc'
        },
        most: {
            reviewCount: 'desc'
        }
    }
// set default page # if needed
    let pageNum = parseInt(page);
    if (!pageNum) {
        pageNum = 1;
    };
// pagination options
    const options = {
        page: pageNum,
        limit: 12,
        collation: {
            locale: 'en'
        },
        sort: filters[sort]
    };
    const pagination = await Stadium.paginate({}, options);
    const allStadia = await Stadium.find({});
    const stadia = pagination.docs;
    // create queryString for sort
    const sortQuery = (filters[sort]) ? `&sort=${sort}` : '';
    res.render('stadia/index', { allStadia, stadia, pagination, sortQuery });
}

// Create Route
    // render form
module.exports.renderNewForm = (req, res) => {
    res.render('stadia/new');
}
// create stadium
module.exports.createStadium = async (req, res) => {
    const stadium = new Stadium(req.body.stadium);
    stadium.owner = req.user;
    stadium.images = req.files.map(x => ({url:x.path, filename:x.filename}));
    stadium.avgRating = 0;
    stadium.reviewCount = 0;
    stadium.geometry = req.session.newLocation.geometry;
    await stadium.save();
    delete req.session.newLocation;
    req.flash('success', 'Successfully created a new stadium');
    res.redirect(`/stadia/${stadium._id}`);
}

// show route
module.exports.showStadium = async (req, res) => {
    try {
        const { id } = req.params;
        const stadium = await Stadium.findById(id).populate('reviews').populate('owner');
        if (!stadium) {
            req.flash('error', 'Cannot find that stadium');
            return res.redirect('/stadia');
        }
        return res.render('stadia/show', { stadium });
    } catch {
        req.flash('error', 'Something went wrong!');
        return res.redirect('/stadia');
    }
}

// edit route
    // render form
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const stadium = await Stadium.findById(id);
    if (!stadium){
        req.flash('error', 'Cannot find that stadium');
        return res.redirect('/stadia')
    }
    res.render('stadia/edit', { stadium });
}
    // edit stadium
module.exports.editStadium = async (req, res) => {
    const { id } = req.params;
    const stadium = await Stadium.findByIdAndUpdate(id, req.body.stadium);
    imgs = req.files.map(x => ({url:x.path, filename:x.filename}));
    stadium.images.push(...imgs);
    stadium.geometry = req.session.newLocation.geometry;
    await stadium.save();
    delete req.session.newLocation;
    req.flash('success', 'Successfully updated stadium')
    res.redirect(`/stadia/${id}`);
}

// delete stadium route
module.exports.deleteStadium = async (req, res) => {
    const { id } = req.params;
    await Stadium.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted stadium')
    res.redirect('/stadia');
}

// delete stadium images
    // render form
module.exports.deleteImgsForm = async (req, res) => {
    const { id } = req.params;
    const stadium = await Stadium.findById(id)
    res.render('stadia/deleteImg', { stadium });
}

    // delete images
module.exports.deleteImgs = async (req, res) => {
    const { id } = req.params;
    const stadium = await Stadium.findById(id);
    if(stadium.images.length > 1) {
        if (req.body.deleteImgs) {
            for (let filename of req.body.deleteImgs) {
                await cloudinary.uploader.destroy(filename);
            }
            await stadium.updateOne({$pull: {images: {filename: {$in:req.body.deleteImgs}}}});
        }
        res.redirect(`/stadia/${id}`);
    }else {
        req.flash('error','You must have at least one image for your stadium');
        res.redirect(`/stadia/${id}/images`)
    }
}