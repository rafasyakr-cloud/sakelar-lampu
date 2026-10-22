console.log('DOM & Event Handling');
document.title= 'Materi DOM & Event Handling';
//let judul = document.getElementById('judul').innerHTML = "<i>Halo RPL B</i> <br> <p>jkcnajscusunciucsc</p>";
judul.innerHTML = '<i>Halo RPL B</i> <br> dewr cefxrerfcerxgegc';
judul.style.color = "red";
judul.style.backgroundcolor = "blue";
judul.style.width = '50%';
judul.classList.add('border');
judul.classList.remove('hidden')


let tombol = document.getElementById('tombol');
tombol.onclick = function () {
    document.querySelector('body').style.backgroundColor = 'red';
    alert(' DIBILANG JANGANN!!')
}