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
    setupAPP(){
        cart = Storage.getCart();
        if(!cart) return;
        this.setCartValues(cart);
        this.populate(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeBtn.addEventListener('click',this.hideCart)
    }

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
                    // get product from products default click amount 1 product
                    let cartItem = {...Storage.getProduct(id), amount : 1 };
                    // add product to the cart
                    cart = [ ...cart , cartItem];
                    //save cart in local storage
                    Storage.saveCart(cart);
                    //set cart values
                    this.setCartValues(cart);
                    // display cart item
                    this.addCartItem(cartItem);
                    // show the cart
                    this.showCart();
                })
            }
        })
    }
    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })
        //set quickly see UI
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
        cartItems.innerText = parseInt(itemsTotal);
    }
    //create cart item to cart-overlay
    addCartItem(cartItem)
    {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
            <img src=${cartItem.image} alt="product" srcset="">
            <div>
                <h4>${cartItem.title}</h4>
                <h5>$${cartItem.price}</h5>
                <span class="remove-item" data-id=${cartItem.id}>remove</span>
            </div>
            <div>   
                <i class="fa fa-chevron-up" data-id=${cartItem.id}></i>
                <p class="item-amount">${cartItem.amount}</p>
                <i class="fa fa-chevron-down" data-id=${cartItem.id}></i>
            </div>
        `;
        //add single cart content to cartContent
        cartContent.appendChild(div)
    }
    // show cart content DOM
    showCart(){
        cartOverlay.classList.add('transparentBcg')
        cartDOM.classList.add('showCart')
    }
    hideCart(){
        cartOverlay.classList.remove('transparentBcg')
        cartDOM.classList.remove('showCart')
    }
    populate(cart){
        cart.forEach(item => this.addCartItem(item));
    }
    cartLogin(){
        
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
    static getCart(){
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')): []; 
    }
}

//list event loaded UI and update UI
document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();
    // const storage = new Storage()
    
    ui.setupAPP();
    // get all products
    products.getProducts().
        then(products => {
        ui.displayProducts(products)
        Storage.saveProducts(products)
    }).then(() => {
        ui.getBagButtons();
    })
})
