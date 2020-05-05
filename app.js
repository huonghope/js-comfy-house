//variables

const cartBtn = document.querySelector('.cart-btn');
const closeBtn = document.querySelector('.close-cart');
const cleaBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center')


// buttonDOM
let buttonsDOM = [];
// cart
let cart = [];

// getting the products
class Products{
    async getProducts(){
        try {
            let result = await fetch('products.json');
            let data = await result.json();
            let products = data.items;
            // recovert products data
            products = products.map(item => {
                const {title, price} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title, price, id, image}
            })
            return products;
        } catch (error) {
            console.log(error)
        }
    }
}

// dislay products
class UI{
    displayProducts(products){
        let result = '';
        products.forEach(product => {
            result += `
            <article class="product">
                <div class="img-container">
                    <img src=${product.image} alt="product" class="product-img" srcset="">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fa fa-shopping-cart">add to bag</i>
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>
            `
        })
        productsDOM.innerHTML = result;
    }
    getBagButtons(){
        const btns = [...document.querySelectorAll('.bag-btn')]; //nodelist

        buttonsDOM = btns;

        btns.forEach(button => {
            // get id from data-id
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            //resetup button
            if(inCart){
                button.innerHTML = "In Cart";
                button.disabled = true;
            }else{
                button.addEventListener('click', (event) => {
                    event.target.innerHTML = "In Cart";
                    event.target.disabled = true;
                    // get product from products
                    let cartItem = {...Storage.getProduct(id), amount : 1 };
                    // add product to the cart
                    cart = [ ...cart , cartItem];
                    //save cart in local storage
                    Storage.saveCart(cart);
                    //set cart values
                    this.setCartValues(cart);
                })
            }
        })
    }
    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
    }
}

//local storage
class Storage{
    static saveProducts(products){
        localStorage.setItem('products', JSON.stringify(products))
    }
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem("products"))
        return products.find(product => product.id === id)
    }
    static saveCart(cart){
        if(!cart) return;
        localStorage.setItem('cart', JSON.stringify(cart))
    }
}

//list event loaded UI and update UI
document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();
    // const storage = new Storage()
    
    // get all products
    products.getProducts().
        then(products => {
        ui.displayProducts(products)
        Storage.saveProducts(products)
    }).then(() => {
        ui.getBagButtons();
    })
})
