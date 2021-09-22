import mongoose from 'mongoose';

const RefreshToken = mongoose.model(
    "RefreshToken",
    new mongoose.Schema({
        refreshToken: String,
        username: String,
    })
);

export default RefreshToken;