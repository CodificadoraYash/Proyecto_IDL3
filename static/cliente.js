document.addEventListener("DOMContentLoaded", () => {
    const contenedorProductos = document.getElementById("productos-container");
    const carritoCounter = document.getElementById("carrito-counter");
    const buscador = document.getElementById("buscador");
    const modalCarrito = document.getElementById("modal-carrito");
    const cerrarModalCarrito = document.getElementById("cerrar-modal");
    const productosModal = document.getElementById("productos-modal");
    const totalSuma = document.getElementById("total-suma");
    const btnCarrito = document.getElementById("carrito");
    const btnIniciarSesion = document.getElementById("iniciar-sesion");
    const modalLogin = document.getElementById("modal-login");
    const formLogin = document.getElementById("formLogin");

    const modalCompra = document.createElement("div");
    modalCompra.id = "modal-compra";
    modalCompra.classList.add("modal");
    modalCompra.innerHTML = `
        <div class="modal-content">
            <h2>Detalles de Compra</h2>
            <form id="formCompra">
                <label for="nombre">Nombre:</label>
                <input type="text" id="nombre" required>
                
                <label for="direccion">Dirección:</label>
                <input type="text" id="direccion" required>
    
                <label for="tipoTarjeta">Tipo de Tarjeta:</label>
                <select id="tipoTarjeta" required>
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="Amex">American Express</option>
                </select>
    
                <label for="numeroTarjeta">Número de Tarjeta:</label>
                <input type="text" id="numeroTarjeta" pattern="[0-9]{16}" placeholder="16 dígitos" required>
    
                <label for="claveTarjeta">Clave de Tarjeta (CVV):</label>
                <input type="password" id="claveTarjeta" pattern="[0-9]{3,4}" placeholder="3 o 4 dígitos" required>
    
                <button type="submit">Confirmar Compra</button>
                <button type="button" id="cerrar-modal-compra">Cancelar</button>
            </form>
        </div>
    `;
    document.body.appendChild(modalCompra);

    const cerrarModalCompra = document.getElementById("cerrar-modal-compra");
    const formCompra = document.getElementById("formCompra");
    // Asegurar que el botón de cerrar esté dentro del formulario
    const btnCerrarLogin = document.createElement("button");
    btnCerrarLogin.textContent = "Cerrar";
    btnCerrarLogin.id = "cerrar-modal-login";
    btnCerrarLogin.type = "button";
    
    formLogin.appendChild(btnCerrarLogin);

    btnCerrarLogin.addEventListener("click", () => {
        modalLogin.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target === modalLogin) {
            modalLogin.style.display = "none";
        }
    });


    const btnComprar = document.createElement("button");
    btnComprar.textContent = "Comprar";
    btnComprar.classList.add("btn-comprar");
    btnComprar.addEventListener("click", () => {
        modalCarrito.style.display = "none";
        modalCompra.style.display = "block";
    });

    let carrito = [];

    const cargarProductos = async () => {
        try {
            const response = await fetch('/productos');
            if (!response.ok) throw new Error(`Error al cargar productos: ${response.statusText}`);

            const productos = await response.json();
            renderizarProductos(productos);

            buscador.addEventListener("input", (e) => {
                const query = e.target.value.toLowerCase();
                const productosFiltrados = productos.filter(producto =>
                    producto.nombre.toLowerCase().includes(query) ||
                    producto.descripcion.toLowerCase().includes(query)
                );
                renderizarProductos(productosFiltrados);
            });

        } catch (error) {
            console.error(error);
            contenedorProductos.innerHTML = '<p>Error al cargar los productos.</p>';
        }
    };
    cerrarModalCompra.addEventListener("click", () => {
        modalCompra.style.display = "none";
    });
    
    
    formCompra.addEventListener("submit", async (event) => {
        event.preventDefault();
    
        // Enviar una solicitud para actualizar el stock de cada producto en el carrito
        try {
            for (const producto of carrito) {
                const response = await fetch('/actualizar-stock', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: producto.id, cantidad: 1 }) // Suponiendo que se compra 1 unidad
                });
    
                if (!response.ok) {
                    throw new Error(`Error al actualizar el stock del producto ${producto.nombre}`);
                }
            }
    
            // Mostrar mensaje de éxito y limpiar el carrito
            Swal.fire("Compra realizada con éxito").then(() => {
                modalCompra.style.display = "none";
                carrito = [];
                actualizarCarrito();
                formCompra.reset();
            });
        } catch (error) {
            console.error(error);
            Swal.fire("Error al realizar la compra", error.message, "error");
        }
    });



// Función para obtener todos los productos desde la API
const obtenerProductos = async () => {
    try {
        const respuesta = await fetch("http://127.0.0.1:5000/productos");
        if (!respuesta.ok) throw new Error("Error al obtener productos");
        const productos = await respuesta.json();
        return productos;
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
};

// Función para renderizar productos con stock, contador e ícono de carrito
const renderizarProductos = (productos) => {
    contenedorProductos.innerHTML = ""; // Limpiar el contenedor

    productos.forEach((producto, index) => {
        const stock = parseInt(producto.stock); // Convertir stock a número

        const productoDiv = document.createElement("div");
        productoDiv.classList.add("producto", `color${(index % 4) + 1}`); // Asignar clase de color

        productoDiv.innerHTML = `
            <h2>${producto.nombre}</h2>
            <p>${producto.descripcion}</p>
            <p>Precio: $${parseFloat(producto.precio).toFixed(2)}</p>
            <p style="color: ${stock > 0 ? 'green' : 'red'};">Stock: ${stock}</p>

            <div style="display: flex; align-items: center; gap: 10px;">
                <input type="number" id="cantidad-${producto.id}" value="1" min="1" max="${stock}" 
                    style="width: 50px; text-align: center;" ${stock === 0 ? "disabled" : ""}>

                <button data-id="${producto.id}" data-nombre="${producto.nombre}" data-precio="${producto.precio}" 
                    class="btn-agregar"
                    style="background-color: ${stock > 0 ? "#8E24AA" : "#D3D3D3"};
                           color: white; border: none; padding: 8px 12px; border-radius: 5px;
                           cursor: ${stock > 0 ? "pointer" : "not-allowed"};" ${stock === 0 ? "disabled" : ""}>
                    <i class="fas fa-cart-plus"></i>
                </button>
            </div>
        `;
        contenedorProductos.appendChild(productoDiv);
    });

    // Agregar eventos a los botones de "Agregar al carrito"
    document.querySelectorAll(".btn-agregar").forEach(boton => {
        boton.addEventListener("click", () => {
            const id = parseInt(boton.dataset.id);
            const nombre = boton.dataset.nombre;
            const precio = parseFloat(boton.dataset.precio);
            const cantidad = parseInt(document.getElementById(`cantidad-${id}`).value);

            agregarAlCarrito(id, nombre, precio, cantidad);
        });
    });

    // Agregar eventos a los botones de "Agregar al carrito"
    document.querySelectorAll(".btn-agregar").forEach(boton => {
        boton.addEventListener("click", () => {
            const id = parseInt(boton.dataset.id);
            const nombre = boton.dataset.nombre;
            const precio = parseFloat(boton.dataset.precio);
            const cantidad = parseInt(document.getElementById(`cantidad-${id}`).value);

            agregarAlCarrito(id, nombre, precio, cantidad);
        });
    });

    // Agregar eventos a los botones de "Agregar al carrito"
    document.querySelectorAll(".btn-agregar").forEach(boton => {
        boton.addEventListener("click", () => {
            const id = parseInt(boton.dataset.id);
            const nombre = boton.dataset.nombre;
            const precio = parseFloat(boton.dataset.precio);
            const cantidad = parseInt(document.getElementById(`cantidad-${id}`).value); // Obtener cantidad seleccionada

            agregarAlCarrito(id, nombre, precio, cantidad); // Agregar con cantidad específica
        });
    });
};


const agregarAlCarrito = (id, nombre, precio, cantidad) => {
    // Verificar si el producto ya está en el carrito
    const productoExistente = carrito.find(item => item.id === id);

    if (productoExistente) {
        // Si el producto ya está en el carrito, actualizar la cantidad
        productoExistente.cantidad += cantidad;
    } else {
        // Si no está en el carrito, agregarlo con la cantidad especificada
        carrito.push({ id, nombre, precio, cantidad });
    }

    actualizarCarrito();
    Swal.fire("Producto agregado al carrito.");
};
    const actualizarCarrito = () => {
        carritoCounter.textContent = carrito.length;
        renderizarCarrito();
    };
    
    const renderizarCarrito = () => {
        productosModal.innerHTML = "";
    
        let total = 0;
            // Crear la tabla
    const tabla = document.createElement("table");
    tabla.innerHTML = `
        <thead>
            <tr>
                <th>Nombre</th>
                <th>Precio Unitario</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
                <th>Eliminar</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;

    const tbody = tabla.querySelector("tbody");
    
         carrito.forEach((producto, index) => {
        // Calcular el subtotal por producto (precio * cantidad)
        const subtotal = producto.precio * producto.cantidad;
        total += subtotal;

        const item = document.createElement("div");
        item.classList.add("producto-carrito");

        item.innerHTML = `
            <p>${producto.nombre} - $${producto.precio.toFixed(2)} x ${producto.cantidad} = $${subtotal.toFixed(2)}</p>
            <button class="btn-eliminar" data-index="${index}">Eliminar</button>
        `;

        productosModal.appendChild(item);
    });

    totalSuma.textContent = `Total: $${total.toFixed(2)}`;

    // Agregar eventos a los botones de "Eliminar"
    document.querySelectorAll(".btn-eliminar").forEach(boton => {
        boton.addEventListener("click", () => {
            const index = boton.dataset.index;
            carrito.splice(index, 1);
            actualizarCarrito();
        });
    });
        document.addEventListener("DOMContentLoaded", () => {
            const modalLogin = document.getElementById("modal-login");
            const btnCerrarLogin = document.getElementById("cerrar-modal-login");
        
            if (btnCerrarLogin) {
                btnCerrarLogin.addEventListener("click", () => {
                    modalLogin.style.display = "none";
                });
            }
        
            window.addEventListener("click", (event) => {
                if (event.target === modalLogin) {
                    modalLogin.style.display = "none";
                }
            });
        });
        
        totalSuma.textContent = `Total: $${total.toFixed(2)}`;

        document.querySelectorAll(".btn-eliminar").forEach(boton => {
            boton.addEventListener("click", () => {
                const index = boton.dataset.index;
                carrito.splice(index, 1);
                actualizarCarrito();
            });
        });

        if (!productosModal.contains(btnComprar)) {
            productosModal.appendChild(btnComprar);
        }
    };

    btnCarrito.addEventListener("click", () => modalCarrito.style.display = "block");
    cerrarModalCarrito.addEventListener("click", () => modalCarrito.style.display = "none");
    cerrarModalCompra.addEventListener("click", () => modalCompra.style.display = "none");
    btnCerrarLogin.addEventListener("click", () => modalLogin.style.display = "none");

    formCompra.addEventListener("submit", (event) => {
        event.preventDefault();
        Swal.fire("Compra realizada con éxito");
        modalCompra.style.display = "none";
        carrito = [];
        actualizarCarrito();
    });

    if (cerrarModalCompra) {
        cerrarModalCompra.addEventListener("click", () => {
            modalCompra.style.display = "none";
        });
    }

    formCompra.addEventListener("submit", (event) => {
        event.preventDefault();
        Swal.fire("Compra realizada con éxito");
        modalCompra.style.display = "none";
        carrito = [];
        actualizarCarrito();
    });

    if (btnIniciarSesion) {
        btnIniciarSesion.addEventListener("click", () => {
            modalLogin.style.display = "block";
        });
    }

    window.addEventListener("click", (event) => {
        if (event.target === modalLogin) {
            modalLogin.style.display = "none";
        }
    });

    formLogin.addEventListener("submit", async function(event) {
        event.preventDefault();
    
        const usuario = document.getElementById("usuario").value.trim();
        const password = document.getElementById("password").value.trim();
    
        if (!usuario || !password) {
            Swal.fire("Por favor ingresa tus credenciales");
            return;
        }
    
        const data = { usuario, password };
        
    
        try {
            const response = await fetch("http://127.0.0.1:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
            }
    
            const res = await response.json();
    
            if (res.mensaje === "Acceso concedido") {
                Swal.fire("Inicio de sesión exitoso").then(() => {
                    modalLogin.style.display = "none";
                    window.location.href = "/admin";
                });
            } else {
                Swal.fire("Usuario o contraseña incorrectos");
            }
        } catch (error) {
            console.error("Error en el login:", error);
            Swal.fire("No se pudo iniciar sesión");
        }
    });

    cargarProductos();
});

