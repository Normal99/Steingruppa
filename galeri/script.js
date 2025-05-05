const files = [
    'img/bilde (1).jfif',
    'img/bilde (3).jfif',
    'img/bilde.jfif'
];

const descriptions = [
    "dette er matias som tar seg en god en i timen",
    "dette er zesty ahh matias",
    "Ivan struggler virkelig med netsiden",
    "Description 4",
    "Description 5"
];

files.forEach((file, index) => {
    const div = document.createElement('div');
    div.className = 'bilde';

    const img = document.createElement('img');
    img.src = file;
    img.alt = `Image ${index + 1}`;

    const p = document.createElement('p');
    p.textContent = descriptions[index];

    div.appendChild(img);
    div.appendChild(p);

    const container = document.querySelector('#bilder');
    container.appendChild(div);
});
