addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// Changes the incoming title
class TitleHandler {
  element(element) {
    element.prepend("Hasan Naseer ");
  }
}

// Changes the incoming header title
class HeadingHandler {
  element(element) {
    element.prepend("My Website for Cloudflare!");
  }
}

// Changes the incoming description
class DescriptionHandler {
  element(element) {
    element.setInnerContent("Thank you for all the work Cloudflare is doing during the COVID-19 crisis! \
    I will not let you down.");
  }
}

// Changes the incoming call to action link
class URLHandler {
  element(element) {
    element.setInnerContent("Check out my Social Media Pages!");
    element.setAttribute("href", "https://www.linkedin.com/in/hasan-naseer-556069154");
    element.setAttribute("href", "https://github.com/hasan41");
  }
}

/**
 * Respond with one random variant webpage
 * @param {Request} req
 */

async function handleRequest(req) {
  // The URL given to us in the problem statement
  const url = 'https://cfw-takehome.developers.workers.dev/api/variants';

  // Use the FETCH API to acquire the variants as an array
  const variants = await fetch(url)
    .then((response) => {
      return response.json();
    })
    .then(json => {
      return json.variants;
    });

  // Get the cookie value if it exists
  const persist = getCookie(req, 'variant');

  let variant_index;

  if (persist === null) {
    // Randomly choose the 0th or 1st element
    variant_index = (Math.random() >= 0.5) ? 0 : 1;
  }
  else {
    // Otherwise it's in our cookie
    variant_index = persist;
  }

  const variant_url = variants[variant_index];

  // Get the response, so we can pass it into the HTMLRewriter
  let res = await fetch(variant_url);

  // Make the HTMLRewriter for extra credit specific attribute and tags
  const custom_rewriter = new HTMLRewriter()
    .on('title', new TitleHandler())
    .on('h1#title', new HeadingHandler())
    .on('p#description', new DescriptionHandler())
    .on('a#url', new URLHandler());

  // Add the cookie, and also reassign res to make the headers mutable
  // Reference: https://developers.cloudflare.com/workers/archive/recipes/setting-a-cookie/
  res = new Response(res.body, res);
  res.headers.set('Set-Cookie', `variant=${variant_index}`);

  return custom_rewriter.transform(res);
}

// Reference: https://developers.cloudflare.com/workers/templates/#cookie_extract
/**
 * Grabs the cookie with name from the request headers
 * @param {Request} request incoming Request
 * @param {string} name of the cookie to grab
 */
function getCookie(request, name) {
  let result = null
  let cookieString = request.headers.get('Cookie')
  if (cookieString) {
    let cookies = cookieString.split(';')
    cookies.forEach(cookie => {
      let cookieName = cookie.split('=')[0].trim()
      if (cookieName === name) {
        let cookieVal = cookie.split('=')[1]
        result = cookieVal
      }
    })
  }
  return result
}