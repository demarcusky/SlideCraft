describe('user happy path', () => {
  it('navigate to login page successfully', () => {
    cy.visit('localhost:3000/');
    cy.url().should('include', 'localhost:3000/login');
  })

  it('should navigate to the registration page when Register link is clicked', () => {
    
    cy.visit('localhost:3000/');

    cy.get('span[name="register-redirect"]').within(() => {
      cy.contains('Register here!').click();
    });

    cy.url().should('include', '/register');
  });

  it('should check the core functionality of slidecraft, by registering then creating, editing and deleting presentation', () => {
    cy.visit('localhost:3000/register');

    cy.get('input[name="email"]').type('user003@email.com');
    cy.get('input[name="name"]').type('user');
    cy.get('input[name="password"]').type('password');
    cy.get('input[name="confirmPassword"]').type('password');

    cy.get('form').submit();
    cy.url().should('include', '/dashboard');

    cy.visit('localhost:3000/dashboard');
  
    cy.get('button[name="addPresentation"]').click();
  
    cy.get('.modal').should('be.visible');
  
    // Use force option to type into the input field
    cy.get('#presName').type('My Presentation', { force: true });
    cy.get('#presDes').type('This is a test presentation', { force: true });
  
    cy.get('#presSub').click();
  
    cy.get('#1').click();
    cy.url().should('include', '/presentation/1/1');

    cy.get('button[name="editTitle"]').click();
    cy.get('input[name="name"]').type('Name change');
    cy.get('#editBtn').click();

    cy.get('button[name="deleteModal"]').click();
    cy.get('#deleteBtn').click();

    cy.get('button[name="addPresentation"]').click();
  
    cy.get('.modal').should('be.visible');
  
    // Use force option to type into the input field
    cy.get('#presName').type('My Presentation', { force: true });
    cy.get('#presDes').type('This is a test presentation', { force: true });
  
    cy.get('#presSub').click();
  
    cy.get('#1').click();

    cy.get('button[name="newSlide"]').click()
    cy.wait(1000)
    cy.get('button[name="forwardSlide"]').click()
    cy.wait(1000)
    cy.get('button[name="backSlide"]').click()

    cy.get('#logoutBtn').click();
    cy.url().should('include', '/login');
  });

  it('should check login then delete presentation', () => {
    cy.visit('localhost:3000/');
    cy.url().should('include', 'localhost:3000/login');
    cy.get('input[name="email"]').type('user003@email.com');
    cy.get('input[name="password"]').type('password');
    cy.get('#loginBtn').click();
    cy.get('#1').click();
    cy.url().should('include', '/presentation/1/1');
    cy.get('button[name="deleteModal"]').click();
    cy.get('#deleteBtn').click();
  });

});

describe('user custom path (tests adding elements and deleting slides)', () => {
  it('should navigate to login page successfully', () => {
    cy.visit('localhost:3000/');
    cy.url().should('include', 'localhost:3000/login');
  })

  it('should login, create a presentation, add slides, add content to slides then delete them', () => {
    
    cy.visit('localhost:3000/');
    cy.url().should('include', 'localhost:3000/login');
    cy.get('input[name="email"]').type('user003@email.com');
    cy.get('input[name="password"]').type('password');
    cy.get('#loginBtn').click();
    cy.url().should('include', '/dashboard');

    cy.get('button[name="addPresentation"]').click();
  
    cy.get('.modal').should('be.visible');
  
    // Use force option to type into the input field
    cy.get('#presName').type('My Presentation', { force: true });
    cy.get('#presDes').type('This is a test presentation', { force: true });
  
    cy.get('#presSub').click();
  
    cy.get('#1').click();
    cy.url().should('include', '/presentation/1/1');

    cy.get('button[name="newSlide"]').click();
    cy.wait(1000);
    cy.get('button[name="forwardSlide"]').click();
    cy.wait(1000);

    cy.get('button[name="textModal"]').click();
    cy.get('textarea[name="text"]').type('input text');
    cy.get('input[name="size"]').type('1');
    cy.get('input[name="width"]').type('30');
    cy.get('input[name="height"]').type('30');
    cy.get('input[name="colour"]').type('#ff0000');
    cy.get('button[name="textSubmit"]').click();
    
    cy.wait(1000);
    cy.get('button[name="backSlide"]').click();
    cy.wait(1000);
    cy.get('button[name="deleteSlideBtn"]').click();
    cy.wait(1000);

    cy.get('button[name="deleteModal"]').click();
    cy.get('#deleteBtn').click();
    cy.url().should('include', '/dashboard');

    cy.get('#logoutBtn').click();
    cy.url().should('include', '/login');
  });
});
