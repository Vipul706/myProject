import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // or 'bcrypt'
const allowedDomains = ['gmail.com', 'mycompany.com'];

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function (value: string) {
                if (!value.includes('@')) return false;
                const [, domain] = value.split('@');
                return allowedDomains.includes(domain);
            },
            message: props => `${props.value} is not from an allowed domain.`
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    cv: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DeepResume"
    },
});

// 🔐 Pre-save hook to hash password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10); // You can increase rounds for more security
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err: any) {
        next(err);
    }
});

export const modelName = "UserVault";
export const schema = userSchema
