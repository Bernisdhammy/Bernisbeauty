document.addEventListener("DOMContentLoaded", () => {
  // Add this function to the script.js file, near the top of the DOMContentLoaded event handler
  function formatPrice(price) {
    return "GH₵" + Number.parseFloat(price).toFixed(2)
  }

  // Add this function to extract price from string
  function extractPrice(priceString) {
    return Number.parseFloat(priceString.replace("GH₵", ""))
  }

  // Mobile menu toggle
  const mobileMenu = document.querySelector(".mobile-menu")
  const navLinks = document.querySelector(".nav-links")

  if (mobileMenu && navLinks) {
    mobileMenu.addEventListener("click", () => {
      navLinks.classList.toggle("active")
      mobileMenu.classList.toggle("active")
    })
  }

  // Shopping cart functionality
  const cartCount = document.getElementById("cart-count")
  const addToCartButtons = document.querySelectorAll(".add-to-cart")
  let cartItems = []

  // Load cart from localStorage if available
  if (localStorage.getItem("cartItems")) {
    try {
      cartItems = JSON.parse(localStorage.getItem("cartItems"))
      updateCartCount()
    } catch (e) {
      console.error("Error loading cart from localStorage", e)
      localStorage.removeItem("cartItems")
    }
  }

  // Add to cart functionality
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const productCard = this.closest(".product-card")
      const productId = productCard.dataset.id
      const productName = productCard.querySelector("h3").textContent
      const productPrice = productCard.querySelector(".product-price").textContent
      const productImage = productCard.querySelector("img").src

      // Check if product is already in cart
      const existingItem = cartItems.find((item) => item.id === productId)

      if (existingItem) {
        existingItem.quantity += 1
      } else {
        cartItems.push({
          id: productId,
          name: productName,
          price: productPrice,
          image: productImage,
          quantity: 1,
        })
      }

      // Save to localStorage
      localStorage.setItem("cartItems", JSON.stringify(cartItems))

      // Update cart count
      updateCartCount()

      // Show added to cart animation
      showAddedToCart(productCard)

      // Redirect to cart page after adding item
      setTimeout(() => {
        window.location.href = "cart.html"
      }, 1000)
    })
  })

  function updateCartCount() {
    if (!cartCount) return
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0)
    cartCount.textContent = totalItems
  }

  function showAddedToCart(productCard) {
    const notification = document.createElement("div")
    notification.className = "added-notification"
    notification.textContent = "Added to cart"
    notification.style.position = "absolute"
    notification.style.top = "10px"
    notification.style.right = "10px"
    notification.style.backgroundColor = "var(--accent-color)"
    notification.style.color = "white"
    notification.style.padding = "0.5rem 1rem"
    notification.style.borderRadius = "var(--border-radius)"
    notification.style.opacity = "0"
    notification.style.transition = "opacity 0.3s ease"

    productCard.style.position = "relative"
    productCard.appendChild(notification)

    // Fade in
    setTimeout(() => {
      notification.style.opacity = "1"
    }, 10)

    // Fade out and remove
    setTimeout(() => {
      notification.style.opacity = "0"
      setTimeout(() => {
        productCard.removeChild(notification)
      }, 300)
    }, 2000)
  }

  // Cart Modal functionality
  const cartModal = document.createElement("div")
  cartModal.id = "cart-modal"
  cartModal.className = "cart-modal"
  cartModal.innerHTML = `
    <div class="cart-modal-content">
        <div class="cart-modal-header">
            <h3>Your Shopping Cart</h3>
            <button id="close-cart" class="close-cart">&times;</button>
        </div>
        <div id="modal-cart-items" class="modal-cart-items">
            <!-- Cart items will be dynamically added here -->
        </div>
        <div class="cart-modal-footer">
            <div class="modal-subtotal">
                <span>Subtotal:</span>
                <span id="modal-subtotal-amount">$0.00</span>
            </div>
            <div class="modal-buttons">
                <a href="cart.html" class="view-cart-button">View Cart</a>
                <button id="modal-checkout-button" class="checkout-button">Checkout</button>
            </div>
        </div>
    </div>
`
  document.body.appendChild(cartModal)

  // Toggle cart modal
  function toggleCartModal() {
    cartModal.classList.toggle("show-cart-modal")
    renderModalCartItems()
  }

  // Close cart modal
  function closeCartModal() {
    cartModal.classList.remove("show-cart-modal")
  }

  // Render cart items in the modal
  function renderModalCartItems() {
    const modalCartItemsContainer = document.getElementById("modal-cart-items")
    if (!modalCartItemsContainer) return

    modalCartItemsContainer.innerHTML = ""

    if (cartItems.length === 0) {
      modalCartItemsContainer.innerHTML = `
            <div class="empty-modal-cart">
                <p>Your cart is empty</p>
            </div>
        `
      return
    }

    cartItems.forEach((item) => {
      const modalCartItemElement = document.createElement("div")
      modalCartItemElement.className = "modal-cart-item"
      modalCartItemElement.innerHTML = `
            <div class="modal-cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="modal-cart-item-details">
                <h4>${item.name}</h4>
                <div class="modal-cart-item-price-qty">
                    <span>${item.price}</span>
                    <span>×</span>
                    <span>${item.quantity}</span>
                </div>
            </div>
            <button class="modal-remove-item" data-id="${item.id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `
      modalCartItemsContainer.appendChild(modalCartItemElement)
    })

    // Update modal subtotal
    const modalSubtotalAmount = document.getElementById("modal-subtotal-amount")
    if (modalSubtotalAmount) {
      const subtotal = cartItems.reduce((total, item) => {
        return total + Number.parseFloat(item.price.replace("$", "")) * item.quantity
      }, 0)
      modalSubtotalAmount.textContent = "$" + subtotal.toFixed(2)
    }

    // Add event listeners to modal remove buttons
    document.querySelectorAll(".modal-remove-item").forEach((btn) => {
      btn.addEventListener("click", function () {
        const itemId = this.dataset.id
        const itemIndex = cartItems.findIndex((item) => item.id === itemId)

        if (itemIndex !== -1) {
          cartItems.splice(itemIndex, 1)

          // Save to localStorage
          localStorage.setItem("cartItems", JSON.stringify(cartItems))

          // Update cart count
          updateCartCount()

          // Re-render modal cart items
          renderModalCartItems()
        }
      })
    })
  }

  // Add event listeners for cart modal
  const cartIcon = document.querySelector(".cart-icon")
  if (cartIcon) {
    cartIcon.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()
      toggleCartModal()
    })
  }

  // Add event listener for the new cart button
  const cartButton = document.getElementById("cart-button")
  if (cartButton) {
    cartButton.addEventListener("click", toggleCartModal)
  }

  // Close cart modal with close button
  document.addEventListener("click", (event) => {
    if (event.target.id === "close-cart") {
      closeCartModal()
    }
  })

  // Close modal when clicking outside of it
  window.addEventListener("click", (event) => {
    if (event.target === cartModal) {
      closeCartModal()
    }
  })

  // Checkout functionality
  document.addEventListener("click", (event) => {
    if (event.target.id === "modal-checkout-button") {
      alert("Proceeding to checkout...")
      // In a real application, this would redirect to a checkout page
    }
  })

  // Make cart icon redirect to cart page
  if (cartIcon) {
    cartIcon.addEventListener("click", (e) => {
      e.preventDefault()
      window.location.href = "cart.html"
    })
  }

  // Testimonial slider
  const testimonials = document.querySelectorAll(".testimonial")
  const dots = document.querySelectorAll(".dot")
  let currentTestimonial = 0

  // Hide all testimonials except the first one
  if (testimonials.length > 1) {
    for (let i = 1; i < testimonials.length; i++) {
      testimonials[i].style.display = "none"
    }
  }

  // Add click event to dots
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      // Hide current testimonial
      testimonials[currentTestimonial].style.display = "none"
      dots[currentTestimonial].classList.remove("active")

      // Show selected testimonial
      currentTestimonial = index
      testimonials[currentTestimonial].style.display = "block"
      dots[currentTestimonial].classList.add("active")
    })
  })

  // Auto-rotate testimonials
  setInterval(() => {
    if (testimonials.length > 1) {
      // Hide current testimonial
      testimonials[currentTestimonial].style.display = "none"
      dots[currentTestimonial].classList.remove("active")

      // Show next testimonial
      currentTestimonial = (currentTestimonial + 1) % testimonials.length
      testimonials[currentTestimonial].style.display = "block"
      dots[currentTestimonial].classList.add("active")
    }
  }, 5000)

  // Newsletter form submission
  const newsletterForm = document.getElementById("newsletter-form")

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault()
      const emailInput = this.querySelector('input[type="email"]')
      const email = emailInput.value

      // Here you would typically send this to your backend
      // For demo purposes, we'll just show a success message

      // Clear the input
      emailInput.value = ""

      // Show success message
      const successMessage = document.createElement("div")
      successMessage.textContent = "Thank you for subscribing!"
      successMessage.style.color = "var(--accent-color)"
      successMessage.style.marginTop = "0.5rem"

      // Remove any existing success message
      const existingMessage = newsletterForm.querySelector(".success-message")
      if (existingMessage) {
        newsletterForm.removeChild(existingMessage)
      }

      successMessage.className = "success-message"
      newsletterForm.appendChild(successMessage)

      // Remove success message after 3 seconds
      setTimeout(() => {
        newsletterForm.removeChild(successMessage)
      }, 3000)
    })
  }

  // Product category filtering
  const categoryTabs = document.querySelectorAll(".category-tab")
  const productCards = document.querySelectorAll(".product-card")

  if (categoryTabs.length > 0 && productCards.length > 0) {
    categoryTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        // Remove active class from all tabs
        categoryTabs.forEach((t) => t.classList.remove("active"))

        // Add active class to clicked tab
        tab.classList.add("active")

        const category = tab.dataset.category

        // Show/hide products based on category
        productCards.forEach((card) => {
          if (category === "all" || card.dataset.category === category) {
            card.style.display = "block"
          } else {
            card.style.display = "none"
          }
        })
      })
    })
  }

  // FAQ accordion
  const faqItems = document.querySelectorAll(".faq-item")

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question")

    question.addEventListener("click", () => {
      // Close all other items
      faqItems.forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains("active")) {
          otherItem.classList.remove("active")
        }
      })

      // Toggle current item
      item.classList.toggle("active")
    })
  })

  // Contact form submission
  const contactForm = document.getElementById("contact-form")

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault()

      // Get form data
      const name = document.getElementById("name").value
      const email = document.getElementById("email").value
      const subject = document.getElementById("subject").value
      const message = document.getElementById("message").value

      // Here you would typically send this data to your backend
      // For demo purposes, we'll just show a success message

      // Clear the form
      contactForm.reset()

      // Show success message
      const formContainer = contactForm.parentElement
      const successMessage = document.createElement("div")
      successMessage.className = "form-success-message"
      successMessage.innerHTML = `
                <h3>Thank you for your message, ${name}!</h3>
                <p>We've received your inquiry and will get back to you shortly.</p>
                <button class="submit-button" id="new-message-btn">Send Another Message</button>
            `
      successMessage.style.textAlign = "center"

      // Hide form and show success message
      contactForm.style.display = "none"
      formContainer.appendChild(successMessage)

      // Add event listener to "Send Another Message" button
      document.getElementById("new-message-btn").addEventListener("click", () => {
        // Remove success message and show form again
        formContainer.removeChild(successMessage)
        contactForm.style.display = "flex"
      })
    })
  }

  // Set active navigation link based on current page
  const currentPage = window.location.pathname.split("/").pop()
  const navigationLinks = document.querySelectorAll(".nav-links a")

  navigationLinks.forEach((link) => {
    const linkHref = link.getAttribute("href")
    if (linkHref === currentPage || (currentPage === "" && linkHref === "index.html")) {
      link.style.color = "var(--accent-color)"
      link.style.fontWeight = "600"
    }
  })
})


