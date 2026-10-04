import Address from "../models/Address.js";

export const createAddress = async (req, res, next) => {
  try {
    const { name, mobile, addressLine1, addressLine2, city, state, pincode } =
      req.body;

    const address = await Address.create({
      user: req.user._id,
      name,
      mobile,
      addressLine1,
      addressLine2: addressLine2 || "",
      city,
      state,
      pincode
    });

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: address
    });
  } catch (error) {
    next(error);
  }
};

export const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({
      user: req.user._id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: addresses.length,
      data: addresses
    });
  } catch (error) {
    next(error);
  }
};

export const getAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    res.json({
      success: true,
      data: address
    });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const { name, mobile, addressLine1, addressLine2, city, state, pincode } =
      req.body;

    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        name,
        mobile,
        addressLine1,
        addressLine2: addressLine2 || "",
        city,
        state,
        pincode
      },
      { new: true, runValidators: true }
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    res.json({
      success: true,
      message: "Address updated successfully",
      data: address
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    res.json({
      success: true,
      message: "Address deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};
