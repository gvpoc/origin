"use strict";
use(function() {

    var pageName = currentPage.name;
    var title = currentPage.properties.get("jcr:title");
    var resourceTitle = properties.get("jcr:title");
    // OLD STYLE var productPath = currentPage.properties.get("cq:productMaster");
    var user = resource.getResourceResolver().adaptTo(Packages.org.apache.jackrabbit.api.security.user.User);
    var externalizerService = sling.getService(Packages.com.day.cq.commons.Externalizer);
    var slingSettingService = sling.getService(Packages.org.apache.sling.settings.SlingSettingsService);
    var product = null;

    var sku = request.getRequestPathInfo().getSelectorString();
    var commerceService = resource.adaptTo(Packages.com.adobe.cq.commerce.api.CommerceService);
    var product = commerceService.getProduct(sku);

    console.log("sjiksjak vollenbak");
    console.log(product);

    var success = false;
    if(product){
        success = true;
    }

    var orderId = request.getParameter("orderId");
    var commerceService = resource.adaptTo(Packages.com.adobe.cq.commerce.api.CommerceService);
    var commerceSession = null;
    if (commerceService != null) {
        var commerceSession = commerceService.login(request, response);
    }
    var _data = {
        page: {
            pageInfo: {},
            category: {},
            attributes: {},
            components: {}
        },
        product: {
            productInfo: {}
        },
        cart: {},
        user: [{
            profile: [{
                profileInfo: {},
                attributes: {}
            }]
        }]
    };

    function _breadcrumb() {
        var result = [];
        var page = currentPage;
        while (page != null) {
            result.unshift(page.getName());
            page = page.getParent();
        }
        var breadcrumb = result.join(':');
        return String(breadcrumb);
    }

    function _pageID() {
        var domain = String(request.getServerName());
        var pageID = domain + String(currentPage.getPath()).replace(/\//g, ':');
        return pageID;
    }

    function _type() {
        var pageType = String(currentPage.getProperties().get("cq:template", "")).replace(/\//g, ':');
        return pageType;
    }

    function _pageInstanceID(pageName) {
        var runmodes = String(slingSettingService.getRunModes());
        var pageInstanceID = runmodes.substring(1, String(runmodes).length - 1).replace(
            / /g, '');
        var keys = pageInstanceID.split(',');
        var value = "";
        for (var i = 0; i < keys.length; i++) {
            el = keys[i];
            if (el !== "crx3" && el !== "repoconfig" && el !== "crx3tar" && el !== "samplecontent") {
                if (value.length == 0)
                    value += el;
                else
                    value += ":" + el;
            }
        }

        return String(value + ":" + pageName);
    }

    function _getLocale() {
        var locale = currentPage.getLanguage(true);
        return String(locale);
    }


    function _externalLink() {
        var rr = resource.getResourceResolver();
        var result = request.getRequestURL();
        return String(result);
    }

    function _pageShortName(breadcrumb) {
        var array = String(breadcrumb).split(':');

        if (array.length > 2) {
            return array[0] + ":[...]:" + array[array.length - 1];
        } else
            return breadcrumb;
    }

    function _shortcut() {
        var parameter = request.getRequestParameter("sc");
        if (parameter != undefined && paremeter != "null")
            return String(parameter);
        return "";
    }

    function _tagging() {

        var tags = currentPage.getTags();
        var returnValue = "";
        if (tags != null && tags.length > 0) {
            for (var i = 0; i < tags.length; i++) {
                var tag = tags[i];
                returnValue += String(tag.getTagID());
                if (i < (tags.length - 1)) {
                    returnValue += ",";
                }

            }
        }

        return returnValue;

    }


    function _version() {
        var date = currentPage.getLastModified();
        if (date != undefined && date != null)
            return date.get(1) + "-" + (date.get(2) + 1) + "-" + date.get(5);
        return "";
    }
    function _hash(bytes){
        var md = java.security.MessageDigest.getInstance("MD5");
        var array = md.digest(bytes);
        var sb = new java.lang.StringBuffer();
        for(var j = 0; j < array.length; ++j){
            sb.append(java.lang.Integer.toHexString((array[j] & 0xFF) | 0x100).substring(1,3));
        }
        return sb.toString();
    }


    function _mapData() {
        _data.page.pageInfo.breadcrumbs = _breadcrumb();
        _data.page.pageInfo.pageShortName = _pageShortName(_data.page.pageInfo.breadcrumbs);
        _data.page.pageInfo.pageName = "content:" + _data.page.pageInfo.breadcrumbs;
        _data.page.pageInfo.destinationURL = _externalLink();
        _data.page.pageInfo.isIframe = properties.get("isIframe") || false;
        _data.page.pageInfo.contentIframe = properties.get("contentIframe") || false;
        _data.page.pageInfo.hierarchie1 = _data.page.pageInfo.breadcrumbs;
        _data.page.pageInfo.title = String(currentPage.getTitle());
        _data.page.pageInfo.internalPageName = String(currentPage.getName());
        _data.page.pageInfo.pageID = _pageID();
        _data.page.pageInfo.tagging = _tagging();
        _data.page.pageInfo.server = String(request.getServerName());
        _data.page.category.type = _type();
        _data.page.pageInfo.urlShortcut = _shortcut();
        _data.page.category.version = _version();
        _data.pageInstanceID = _pageInstanceID(_data.page.pageInfo.pageName);
        _data.language = _getLocale();

        // user info
        _data.user[0].profile[0].attributes.loggedIn = String(user.getID()) != "anonymous";
        if (_data.user[0].profile[0].attributes.loggedIn) {
            _data.user[0].profile[0].attributes.username = String(_hash(user.getID().getBytes("UTF-8")));
        }


        // product info is present on the product-page
        if (product != null) {
            _data.product.productInfo.sku = String(product.getSKU());
            _data.product.productInfo.title = String(product.getTitle());
            _data.product.productInfo.description = String(product.getDescription());
            _data.product.productInfo.brand = String(product.getProperty("brand",java.lang.String));
            _data.product.productInfo.gender = String(product.getProperty("gender",java.lang.String));
            _data.product.productInfo.material = String(product.getProperty("material",java.lang.String));
            _data.product.productInfo.shape = String(product.getProperty("shape",java.lang.String));
            _data.product.productInfo.type = String(product.getProperty("type",java.lang.String));
        }

        if (commerceSession != null) {

            _data.cart.productsInCart = String(commerceSession.getCartEntryCount());
            if ( _data.cart.productsInCart != null && _data.cart.productsInCart != "" ) {
                _data.cart.productsInCart = Number(commerceSession.getCartEntryCount());
            } else {
                _data.cart.productsInCart = 0
            }
            if (_data.cart.productsInCart != 0) {
                _data.cart.orderId = String(commerceSession.getOrderId());
                var cartprice = commerceSession.getCartPriceInfo(null);
                if (cartprice != null) {
                    _data.cart.cartAmount = String(cartprice.get(0).getAmount());
                }
                _data.cart.cartEntries = [];

                for (var i = 0; i < commerceSession.getCartEntryCount(); i++) {
                    var cartEntry = {};
                    var entry = commerceSession.getCartEntries().get(i);
                    cartEntry.qty = String(entry.getQuantity());
                    cartEntry.sku = String(entry.getProduct().getSKU());
                    cartEntry.title = String(entry.getProduct().getTitle());
                    cartEntry.formattedPrice = String(entry.getPrice(null));
                    var prices = entry.getPriceInfo(null);
                    if (prices != null) {
                        cartEntry.price = String(prices.get(0).getAmount());
                    }
                    _data.cart.cartEntries[i] = cartEntry;
                }
            } else if (commerceSession.getPlacedOrder(orderId) !== null && orderId !== null) {
                var placedOrder = commerceSession.getPlacedOrder(orderId);
                _data.cart.orderId = String(placedOrder.getOrder().get("orderId"));
                var entries = null;
                if (placedOrder.getCartEntries() != null) {
                    entries = placedOrder.getCartEntries().toArray();
                }
                var orderMap = placedOrder.getOrder();
                _data.cart.cartAmount = String(orderMap.get("cartSubtotal"));
                _data.cart.shippingCost = String(orderMap.get("orderShipping"));
                _data.cart.tax = String(orderMap.get("orderTotalTax"));
                _data.cart.totalPrice = String(orderMap.get("orderTotalPrice"));
                _data.cart.orderstatus = String(orderMap.get("orderStatus"));
                if (entries != null) {
                    _data.cart.cartEntries = [];
                    _data.cart.itemsInCart = String(entries.length);
                    var ce = null;
                    for (var i = 0; i < entries.length; i++) {
                        var cartEntry = {};
                        ce = entries[i];
                        cartEntry.qty = String(ce.getQuantity());
                        cartEntry.sku = String(ce.getProduct().getSKU());
                        cartEntry.title = String(ce.getProduct().getTitle());
                        cartEntry.formattedPrice = String(ce.getPrice(null));
                        var prices = ce.getPriceInfo(null);
                        if (prices != null) {
                            cartEntry.price = String(prices.get(0).getAmount());
                        }
                        _data.cart.cartEntries[i] = cartEntry;
                    }
                }

            }
        }

    }
    _mapData();

    return {
        init: JSON.stringify(_data, null, 2),
    };
});