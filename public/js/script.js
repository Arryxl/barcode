document.addEventListener('DOMContentLoaded', function() {
    let scanBuffer = '';
    let lastScanTime = 0;
    const SCAN_TIMEOUT = 50;

    const exitButton = document.querySelector('.fullscreen-exit');
    exitButton.addEventListener('click', salirModoPantallaCompleta);

    document.addEventListener('keydown', function(event) {
        const currentTime = new Date().getTime();

        if (currentTime - lastScanTime > SCAN_TIMEOUT && scanBuffer.length > 0) {
            scanBuffer = '';
        }

        lastScanTime = currentTime;

        if (event.key === 'Enter') {
            if (scanBuffer.length > 0) {
                event.preventDefault();
                procesarCodigoEscaneado(scanBuffer);
                scanBuffer = '';
            }
        } 
        else if (event.key.length === 1) {
            scanBuffer += event.key;
        }
    });
});

function procesarCodigoEscaneado(codigo) {
    console.log('Código escaneado:', codigo);
    fetch(`http://localhost:3000/api/allproductos?codigo=${codigo}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(productos => {
        if (productos && productos.length > 0) {
            mostrarProductoPantallaCompleta(productos[0]);
        } else {
            mostrarProductoNoEncontradoPantallaCompleta();
        }
    })
    .catch(error => {
        console.error('Error al buscar producto:', error);
        const mensajeExistente = document.querySelector('.fullscreen-message');
        if (mensajeExistente) {
            mensajeExistente.style.display = 'block';
            mensajeExistente.innerHTML = 'Error al buscar el producto. Intente nuevamente.';
            mensajeExistente.style.color = '#e74c3c';
        }
       
        const productContainer = document.getElementById('product-container');
        if (productContainer) {
            productContainer.innerHTML = '';
        }
    });
}

function salirModoPantallaCompleta() {
    const prevUrl = localStorage.getItem('prevUrl') || '/index.html';
    window.location.href = prevUrl;
}

function mostrarProductoPantallaCompleta(producto) {
    console.log(producto)
    const mensajeExistente = document.querySelector('.fullscreen-message');
    if (mensajeExistente) {
        mensajeExistente.style.display = 'none';
    }
    
    const productContainer = document.getElementById('product-container');
    productContainer.innerHTML = '';
    
    const productoElement = document.createElement('div');
    productoElement.className = 'fullscreen-product product-animation';
    
    // Note the reordering of elements to match the screenshot
    productoElement.innerHTML = `
        <div class="codigo">Código: ${producto.Barras}</div>
        <div class="precio">$${producto.Precio.toLocaleString('es-ES')}.00</div>
        <div class="nombre">${producto.UnidadMedida}</div>
        <div class="descripcion">${producto.Descripcion || ''}</div>
    `;
    
    productContainer.appendChild(productoElement);
    
    const audio = new Audio('/sounds/beep-success.mp3');
    audio.play().catch(e => console.log('No se pudo reproducir el sonido'));
}

function mostrarProductoNoEncontradoPantallaCompleta() {
    const mensajeExistente = document.querySelector('.fullscreen-message');
    if (mensajeExistente) {
        mensajeExistente.style.display = 'block';
        mensajeExistente.innerHTML = `
            <div style="margin-bottom: 20px;">⚠️</div>
            <div style="color: #e74c3c; font-size: 3rem;">Producto no encontrado</div>
            <div style="font-size: 1.5rem; margin-top: 20px; color: #7f8c8d;">
                El código escaneado no corresponde a ningún producto registrado.
            </div>
        `;
    }
    
    const productContainer = document.getElementById('product-container');
    if (productContainer) {
        productContainer.innerHTML = '';
    }
    
    const audio = new Audio('/sounds/beep-error.mp3');
    audio.play().catch(e => console.log('No se pudo reproducir el sonido'));
}