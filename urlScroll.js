window.addEventListener('popstate', router);
window.addEventListener('load', router);
document.body.addEventListener('scroll', scrollHandler);


function scrollHandler() {
    document.querySelectorAll('section').forEach(function (el) {
        if (isScrolledIntoView(el)) history.replaceState(false, el.innerText, el.id);
    })
}

function router() {
    let targetSection = document.getElementById(location.pathname);
    if (targetSection) targetSection.scrollIntoView();
}

function isScrolledIntoView(el) {
    let rect = el.getBoundingClientRect();
    let elemTop = rect.top;
    let elemBottom = rect.bottom;
    return (elemTop >= 0) && (elemBottom <= window.innerHeight);
}
