document.addEventListener("DOMContentLoaded", function () {
    cargarProductos();
    agregarBotonCerrarSesion();
});

document.getElementById("formProducto").addEventListener("submit", function (event) {
    event.preventDefault();
    agregarProducto();
});

document.getElementById("formEditarProducto").addEventListener("submit", function (event) {
    event.preventDefault();
    actualizarProducto();
});

// Función para obtener los productos y mostrarlos en la tabla
function cargarProductos() {
    fetch("/productos")
        .then(response => response.json())
        .then(productos => {
            const tabla = document.getElementById("productosTabla");
            tabla.innerHTML = "";
            productos.forEach(producto => {
                let fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${producto.id}</td>
                    <td>${producto.nombre}</td>
                    <td>${producto.descripcion}</td>
                    <td>${producto.precio}</td>
                    <td>${producto.stock}</td>
                    <td>
                        <button class="btn-editar" onclick="mostrarEditarProducto(${producto.id}, '${producto.nombre}', '${producto.descripcion}', ${producto.precio}, ${producto.stock})">
                            <i class="fas fa-edit"></i> <!-- Icono de editar -->
                        </button>
                        <button class="btn-eliminar" onclick="eliminarProducto(${producto.id})">
                            <i class="fas fa-trash"></i> <!-- Icono de eliminar -->
                        </button>
                    </td>
                `;
                tabla.appendChild(fila);
            });
        });
}

// Función para agregar un producto con SweetAlert2
function agregarProducto() {
    const data = {
        nombre: document.getElementById("nombre").value.trim(),
        descripcion: document.getElementById("descripcion").value.trim(),
        precio: parseFloat(document.getElementById("precio").value),
        stock: parseInt(document.getElementById("stock").value),
    };

    if (!data.nombre || !data.descripcion || isNaN(data.precio) || isNaN(data.stock)) {
        Swal.fire("Error", "Todos los campos deben estar completos y válidos.", "error");
        return;
    }

    fetch("/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(() => {
            cargarProductos();
            document.getElementById("formProducto").reset();
            Swal.fire("Éxito", "Producto agregado correctamente.", "success");
        });
}

// Función para eliminar un producto con SweetAlert2
function eliminarProducto(id) {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "No podrás revertir esta acción",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminarlo"
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/productos/${id}`, { method: "DELETE" })
                .then(response => response.json())
                .then(() => {
                    cargarProductos();
                    Swal.fire("Eliminado", "El producto ha sido eliminado correctamente.", "success");
                });
        }
    });
}

// Mostrar modal de edición con los datos del producto
function mostrarEditarProducto(id, nombre, descripcion, precio, stock) {
    document.getElementById("editId").value = id;
    document.getElementById("editNombre").value = nombre;
    document.getElementById("editDescripcion").value = descripcion;
    document.getElementById("editPrecio").value = precio;
    document.getElementById("editStock").value = stock;

    document.getElementById("modalEditar").style.display = "block";
}

// Función para actualizar un producto con SweetAlert2
function actualizarProducto() {
    const id = document.getElementById("editId").value;
    const nombre = document.getElementById("editNombre").value.trim();
    const descripcion = document.getElementById("editDescripcion").value.trim();
    const precio = parseFloat(document.getElementById("editPrecio").value);
    const stock = parseInt(document.getElementById("editStock").value);

    if (!nombre || !descripcion || isNaN(precio) || isNaN(stock)) {
        Swal.fire("Error", "Todos los campos deben estar completos y válidos.", "error");
        return;
    }

    const data = { nombre, descripcion, precio, stock };

    fetch(`/productos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(() => {
            cargarProductos();
            cerrarModal();
            Swal.fire("Actualizado", "El producto ha sido actualizado correctamente.", "success");
        })
        .catch(error => Swal.fire("Error", "No se pudo actualizar el producto.", "error"));
}

// Función para cerrar el modal de edición
function cerrarModal() {
    document.getElementById("modalEditar").style.display = "none";
}

// Agregar botón de cancelar dentro del modal de edición
document.addEventListener("DOMContentLoaded", function() {
    const modalContent = document.querySelector("#modalEditar .modal-content");
    const cancelarBtn = document.createElement("button");
    cancelarBtn.textContent = "Cancelar";
    cancelarBtn.classList.add("btn-cancelar");
    cancelarBtn.onclick = cerrarModal;
    modalContent.appendChild(cancelarBtn);
});

// Función para cerrar sesión
function cerrarSesion() {
    Swal.fire({
        title: "¿Cerrar sesión?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, salir",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                icon: "success",
                title: "Sesión cerrada",
                text: "Redirigiendo al inicio...",
                timer: 2000,
                showConfirmButton: false
            });

            setTimeout(() => {
                window.location.href = "http://127.0.0.1:5000/";
            }, 2000);
        }
    });
}

