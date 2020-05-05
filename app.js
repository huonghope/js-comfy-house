const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
    space: "savydth17w1r",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: "73w_v6f_YrMPtEQc7fu9QQN_Tb12bl-3kbGGmKjzEb0"
});

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
            let content = await client.getEntries({
                content_type: 'comfyHouseProduct'
            });
            console.log(content)
            // let result = await fetch('products.json');
            // let data = await result.json();
            let products = content.items;
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
    cartLogic(){
        // clear cart button
        cleaBtn.addEventListener('click',() => this.clearCart());

        //cart functionlity - remove single product
        cartContent.addEventListener('click', event => {
            if(event.target.classList.contains('remove-item')){
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement) //remove UI
                this.removeItem(id) //remove logic
            }else if(event.target.classList.contains('fa-chevron-up')){ //up count for product
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id); //search amount item and increase amount -- automatic update cart
                tempItem.amount++;
                Storage.saveCart(cart);  
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }else if(event.target.classList.contains('fa-chevron-down')){
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id); //search amount item and increase amount
                tempItem.amount--;
                if(tempItem.amount > 0)
                {
                    Storage.saveCart(cart);  
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                }else{
                    //Delete product
                    cart = cart.filter(item => item.id !== id);
                    this.setCartValues(cart);
                    Storage.saveCart(cart);
                    
                    //remove UI
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);

                    //resetup button Add
                    const btns = [...document.querySelectorAll(".bag-btn")];
                    btns.forEach(button => {
                        if (parseInt(button.dataset.id) === id) {
                            button.disabled = false;
                            button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to bag`;
                        }
                    });
                }
            }
        })
    }
    clearCart(){
        if(confirm("Clear cart")){
            let cartItems = cart.map(item => item.id);
            cartItems.forEach(id => this.removeItem(id))
        }   
        //remove DOM
        while(cartContent.children.length > 0){
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart();
    }
    removeItem(id)
    {
        //resave to localStorage
        cart = cart.filter(item => item.id !== id); //empty cart
        this.setCartValues(cart);
        Storage.saveCart(cart);

        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fa fa-shopping-cart"></i>add to cart`;
    }
    getSingleButton(id)
    {
        return buttonsDOM.find(button => button.dataset.id === id)
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
        ui.cartLogic();
    })
})
