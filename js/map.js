ymaps.ready(init);
function init() {
    var myMap = new ymaps.Map("map", {
        center: [53.8945, 27.5477], 
        zoom: 15
    });

    const hintContent = window.i18n ? window.i18n.translate('map.hint_content') : 'Мое местоположение';
    const balloonContent = window.i18n ? window.i18n.translate('map.balloon_content') : 'Я здесь!';

    var myPlacemark = new ymaps.Placemark([53.8945, 27.5477], {
        hintContent: hintContent,
        balloonContent: balloonContent
    });

    myMap.geoObjects.add(myPlacemark);
}