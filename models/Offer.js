const { Schema, models, model } = require("mongoose");
const Joi = require("joi");

const statuses = ["Active", "Finished"];

var validateEmail = function (email) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const offerSchema = new Schema({
  status: {
    type: String,
    enum: statuses,
    default: "Active",
    required: true,
  },
  customer: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
  },
  address: {
    type: String,
    required: true,
    maxlength: 500,
  },
  contactPerson: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
    validate: [validateEmail, "Please fill a valid email address"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  contactTel: { type: String, required: true, minlength: 2, maxlength: 100 },
  pib: { type: String, required: true, maxlength: 500 },
  mib: { type: String, required: true, maxlength: 500 },
  listOfProduct: {
    type: Array,
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: "Mora biti bar jedan proizvod",
    },
  },
  avans: {
    type: Number,
    default: 0,
  },
  totalPrice: {
    type: Number,
    default: 0,
    //min: 0,
  },
  dateOfIssue: {
    type: Date,
    default: Date.now,
    required: true,
  },
  dateOfValidity: {
    type: Date,
    required: true,
  },
  placeOfIssue: { type: String, required: true, maxlength: 500 },
  methodOfPayment: {
    type: String,
    enum: ["Virmanski", "Gotovinski", "Avansno"],
    default: "Virmanski",
    required: true,
  },
  note: {
    type: String,
    maxlength: 1000,
    default: "",
  },
  offerId: { type: Number, unique: true },
});

// Define a pre-save middleware
offerSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const highestDoc = await this.model("Offer")
        .findOne({})
        .sort({ offerId: -1 });
      this.offerId = highestDoc ? highestDoc.offerId + 1 : 1;
    } catch (err) {
      console.error("Error fetching highest orderId:", err);
      return next(err);
    }
  }
  next();
});

const Offer = models.Offer || model("Offer", offerSchema);

//validacija dolaznog proizvoda unutar liste proizvoda
//unutar jedne porudbine
function validateOffer(offer) {
  let product = Joi.object({
    id: Joi.string().required(),
    name: Joi.string().max(50).required(),
    price: Joi.number().min(0).required(),
    quantity: Joi.number().min(1).required(),
  });

  const schema = Joi.object({
    status: Joi.string()
      .valid(...statuses)
      .required(),
    customer: Joi.string().min(2).max(100).required(),
    address: Joi.string().max(500).required(),
    contactPerson: Joi.string().min(2).max(100).required(),
    contactEmail: Joi.string().email().required(),
    contactTel: Joi.string().min(2).max(100).required(),
    pib: Joi.string().max(500).required(),
    mib: Joi.string().max(500).required(),
    listOfProduct: Joi.array().items(product).min(1).required(),
    avans: Joi.number().min(0),
    totalPrice: Joi.number().min(0).required(),
    dateOfIssue: Joi.date().required(),
    dateOfValidity: Joi.date().required(),
    placeOfIssue: Joi.string().max(500).required(),
    methodOfPayment: Joi.string()
      .valid("Virmanski", "Gotovinski", "Avansno")
      .required(),
    note: Joi.string().max(1000).allow(""),
    offerId: Joi.number(),
  });

  return schema.validate(offer);
}

exports.Offer = Offer;
exports.validateOffer = validateOffer;
