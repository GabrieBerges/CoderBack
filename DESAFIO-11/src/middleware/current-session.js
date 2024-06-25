const checkSession = (req, res, next) => {
    console.log("en checkSession");
    console.log(req.session.user);
    if (req.session.user) {
        if (req.session.user.role === "admin" && (req.path === "/chat" || req.path === "/products")) {
            return res.redirect('/realtimeproducts');
        }
        if (req.session.user.role === "usuario" && req.path === "/realtimeproducts") {
            return res.redirect('/products');
        }
        next();
    } else {
        return res.redirect('/');
    }
};

module.exports = { checkSession };
