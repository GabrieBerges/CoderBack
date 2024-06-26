const checkSessionAdmin = (req, res, next) => {
    console.log("en checkSession");
    console.log(req.session.user);
    if (req.session.user) {
        if (req.session.user.role === "usuario") {
            return res.redirect('/products');
        }
        next();
    } else {
        return res.redirect('/');
    }
};

const checkSessionUser = (req, res, next) => {
    console.log("en checkSessionUser");
    console.log(req.session.user);
    if (req.session.user) {
        if (req.session.user.role === "admin") {
            return res.redirect('/realtimeproducts');
        }
        next();
    } else {
        return res.redirect('/');
    }
};


module.exports = { checkSessionAdmin, checkSessionUser };