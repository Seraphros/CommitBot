function compareTabs(tabOriginal, newTab) {
    let newItems = [];
    newTab.forEach(function (item) {
        let present = false;
        tabOriginal.forEach(function (item2) {
            if (item === item2) {
                present = true
            }
        });

        if (present === false) {
            newItems.push(item);
        }
    });

    return newItems;
}

module.exports = {compareTabs};
