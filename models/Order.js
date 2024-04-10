const { Schema, models, model } = require("mongoose");
const Joi = require("joi");

const statuses = ["Active", "Ready", "Finished"];
const developers = ["Decorwood", "Svadbenicvet"];

const orderSchema = new Schema({
  status: {
    type: String,
    enum: statuses,
    default: "Active",
    required: true,
  },
  developer: {
    type: String,
    enum: developers,
    default: "decorwood",
    required: true,
  },
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
  orderDate: {
    type: Date,
    default: Date.now,
  },
  deliveryTime: {
    type: Date,
  },
  customer: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  address: {
    type: String,
    required: true,
    maxlength: 500,
  },
  note: {
    type: String,
    maxlength: 1000,
    default: "",
  },
  orderId: { type: Number, unique: true },
});

// Define a pre-save middleware
orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const highestDoc = await this.model("Order")
        .findOne({})
        .sort({ orderId: -1 });
      this.orderId = highestDoc ? highestDoc.orderId + 1 : 1;
    } catch (err) {
      console.error("Error fetching highest orderId:", err);
      return next(err);
    }
  }
  next();
});

const Order = models.Order || model("Order", orderSchema);

//validacija dolaznog proizvoda unutar liste proizvoda
//unutar jedne porudbine
function validateOrder(order) {
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
    developer: Joi.string()
      .valid(...developers)
      .required(),
    customer: Joi.string().min(2).max(50).required(),
    address: Joi.string().max(500).required(),
    listOfProduct: Joi.array().items(product).min(1).required(),
    avans: Joi.number().min(0),
    totalPrice: Joi.number().min(0).required(),
    orderDate: Joi.date().required(),
    deliveryTime: Joi.date().required(),
    note: Joi.string().max(1000).allow(""),
    orderId: Joi.number(),
  });

  return schema.validate(order);
}

exports.Order = Order;
exports.validateOrder = validateOrder;
