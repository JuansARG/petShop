Vue.createApp({
	data() {
		return {
			articulos: [],
			articulosFiltrados: [],
			articulosBajoStock: [],
			articulosTipoJuguetes: [],
			articulosTipoMedicamentos: [],
			tipos: [],
			checked: [],
			input: "",
			carrito: {},
			nuevoId: 1,
			total: 0,
			cantidad: 0,
			nombre: "",
			mascota: "",
			telefono: "",
			mail: "",
			mensaje: "",
		};
	},
	created() {
		this.cargarDatos();
	},
	methods: {
		cargarDatos() {
			fetch("https://apipetshop.herokuapp.com/api/articulos")
				.then((respuesta) => respuesta.json())
				.then((datos) => {
					this.articulos = datos.response;
					this.articulos.forEach((a) => this.agregarNuevoId(a));
					this.articulosFiltrados = [...this.articulos];
					this.extraerTipos();
					this.buscarArticulosBajoStock();
					this.consultarLocalStorage();
					this.filtrarArticulosPorTipos();
				})
				.catch((e) => console.log(e));
		},
		extraerTipos() {
			let fn = (e) => e.tipo;
			this.tipos = [...new Set(this.articulos.filter(fn).map(fn))];
		},
		buscarArticulosBajoStock() {
			this.articulosBajoStock = this.articulos.filter((a) => a.stock < 5);
		},
		agregarNuevoId(articulo) {
			articulo.nuevoId = this.nuevoId;
			this.nuevoId++;
		},
		buscarArticulo(id) {
			return this.articulos.find((a) => a.nuevoId === id);
		},
		agregarAlCarrito(id) {
			let articulo = this.buscarArticulo(id);

			if (this.carrito.hasOwnProperty(articulo.nuevoId)) {
				this.aumentarCantidad(articulo.nuevoId);
			} else {
				let e = {
					id: articulo.nuevoId,
					nombre: articulo.nombre,
					cantidad: 1,
					precio: articulo.precio,
				};
				this.carrito[e.id] = { ...e };
				this.guardarEnLocalStorage();
			}
		},
		aumentarCantidad(id) {
			let articulo = this.buscarArticulo(id);
			if (this.carrito[id].cantidad === articulo.stock) {
				this.alertaLimiteDeUnidades();
			} else {
				this.carrito[id].cantidad++;
				this.carrito[id].precio = articulo.precio * this.carrito[id].cantidad;
				this.guardarEnLocalStorage();
			}
		},
		decrementarCantidad(id) {
			let articulo = this.buscarArticulo(id);
			if (this.carrito[id].cantidad === 1) {
				this.eliminarDelCarrito(id);
			} else {
				this.carrito[id].cantidad--;
				this.carrito[id].precio = articulo.precio * this.carrito[id].cantidad;
			}
			this.guardarEnLocalStorage();
		},
		eliminarDelCarrito(id) {
			delete this.carrito[id];
			this.guardarEnLocalStorage();
			this.alertaEliminarDelCarrito();
		},
		vaciarCarrito() {
			this.carrito = {};
			this.guardarEnLocalStorage();
			this.alertaVaciarCarrito();
		},
		consultarLocalStorage() {
			if (localStorage.getItem("carrito")) {
				this.carrito = JSON.parse(localStorage.getItem("carrito"));
			}
		},
		guardarEnLocalStorage() {
			localStorage.setItem("carrito", JSON.stringify(this.carrito));
		},
		filtrarArticulosPorTipos() {
			this.articulosTipoJuguetes = this.articulos.filter(
				(a) => a.tipo == this.tipos[0]
			);
			this.articulosTipoMedicamentos = this.articulos.filter(
				(a) => a.tipo == this.tipos[1]
			);
		},
		comprarTodo() {
			this.carrito = {};
			this.guardarEnLocalStorage();
			this.alertaComprarTodo();
		},
		//ALERTAS
		alertaAgregarAlCarro() {
			Swal.fire({
                title: "¡Has agregado un producto al carrito!.",
                width: 600,
                padding: "3em",
                color: "#716add",

                backdrop:`
                            rgba(0,0,123,0.4)
                            url("/assets/images/alerta.png")
                            left bottom
                            no-repeat
                        `,
            })
		},
		alerta() {
			Swal.fire("¡Gracias por suscribirte a nuestras noticias!");
		},
		alertaLimiteDeUnidades(){
			Swal.fire("Usted tiene toda las unidades que disponemos en el carrito en este momento!");
		},
		alertaVaciarCarrito() {
			Swal.fire("Se han eliminado todos los articulos del carrito!");
		},
		alertaEliminarDelCarrito() {
			Swal.fire("Se ha eliminado dicho elemento del carrito!");
		},
		alertaComprarTodo() {
			Swal.fire("Gracias por su compra vuelva prontos!");
		},
		checkForm(e){
			e.preventDefault();
			Swal.fire("Tu mensaje se ha enviado", "¡Muchas gracias por escribirnos!");
			this.nombre = "";
			this.mascota = "";
			this.telefono = "";
			this.mail = "";
			this.mensaje = "";
		},
	},
	computed: {
		filtrar() {
			let filtro1 = this.articulos.filter((d) => d.nombre.includes(this.input));
			this.articulosFiltrados = filtro1;
		},
		calcularTotal() {
			this.total = Object.values(this.carrito).reduce(
				(acc, { precio }) => acc + precio,
				0
			);
		},
		calcularCantidad() {
			this.cantidad = Object.values(this.carrito).reduce(
				(acc, { cantidad }) => acc + cantidad,
				0
			);
		},
		//guardadoAutomaticoEnLocalStorage(){
		//localStorage.setItem("carrito", JSON.stringify(this.carrito));
		//}
	},
}).mount("#app");
