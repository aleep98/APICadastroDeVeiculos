// ⚠️ DEPRECATED - Use src/services/user.service.js ao invés
// Este arquivo é mantido apenas para referência histórica

import User from "../models/User.js"
import email from "../models/User.js"

class UserController {
    async store(req, res) {
        const { email } = req.body;

        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({email})
        }
        return res.json(user);
    }
}

export default new UserController();
