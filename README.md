# Isomporh

A simple framework inspired by [Next.js](https://nextjs.org/) to create Server and Statically Rendered React Apps.

Read the [blog post](https://blog.devesh.tech/post/framework-for-creating-isomorphic-react-apps) detailing the process of ideation and creation of this project.

- [Starting An Isomorph Project](#installation-and-setup)
- [Required Project Structure](#required-project-structure)
- [Pages Structure and Data Fetching](#pages-structure-and-data-fetching)
- [Handling Page Meta Data](#handling-page-meta-data)
- [Determining When your page is on the client-side](#determining-when-your-page-is-on-the-client-side)
- [Environment Variables](#environment-variables)
- [Custom Error Pages](#custom-error-pages)
- [Building and Serving to Production](#building-and-serving-on-production)

#### Work In Progress

- Supporting dynamic page routes.

### Existing Features

- Server Side Rendering with data fetching on the server.
- Static Page Generation and serving with revalidation and `Stale-While-Revalidate` approach of handling serving.
- Server Side data fetching utilities like `getDataOnServer` and `getStaticProps` and function to populate page meta data with `getPageMeta`.
- Full Client-Side Rendering/Hydration of pages to enable user interactivity and events.
- `useInitialData` hook to access initial data fetched on the server across the entire component chain.
- All Environment variables accessible on server-side and variables starting `ISOMORPH_PUBLIC_...` accessible on the client-side.
- Minification and Tree-Shaking of code in Production mode.
- Bundle Caching in Production mode to enable super-fast load times for both server-rendered and statically generated pages post first build.
- Custom error pages using `_error` for handling `404`s and `500`s.

### Installation and Setup

#### Using `create-isomorph-app`

The simplest way to get started with an isomorph project is using `create-isomorph-app`.

```
npm i -g isomorph-web
npx create-isomorph-app [project directory] [?project name]

// ex:
npx create-isomorph-app my-isomorph-project "Isomorph App"
```

#### Setting Up Manually

As of now to setup an isomorph project, create a directory for your project. I'm assuming you have npm and Node.js already installed.

```
mkdir my-isomorph-project
cd ./my-isomorph-project
npm init -y
```

Once done with this, install `isomorph-web` using npm or yarn.

```
yarn add isomorph-web

// or

npm i --save isomorph-web
```

Create an `src` folder, this will house all your components, utils and project related JavaScript code. Inside it create a `pages` folder that will house your page files and have React components associated with them.

Check the [Required Project Structure](#required-project-structure) section to know the sample structure of isomorph projects.

Update your package.json file's `scripts` to the following:

```diff
"scripts": {
+ 	"build": "isomorph-web build",
+ 	"dev": "isomorph-web dev",
+ 	"start": "isomorph-web start"
}
```

Once done, run the dev server using:

```
npm run dev
```

### Required Project Structure

Your pages have to be housed inside the `src/pages` folder of your project directory.

```
.
├── src/
│   ├── pages/
│   │   ├── index.js
│   │   └── static-page.js
│   ├── components/
│   │   └── ...
│   └── utils/
│       └── ...
└── package.json
```

I'm currently working on adding dynamic route support soon.

### Pages Structure and Data Fetching

Pages are simple React component files that expose a default React component export, along with a few other exports to facilitate data fetching and meta data handling.

```javascript
// No need to 'import React from "react";', it's always in scope.
import useInitialData from "isomorph-web/package/hooks/useInitialData";

const PageComponent = () => {
	const initialData = useInitialData(); // Use this hook to access data fetched for the page in getPropsOnServer/getStaticProps.

	return (
		<>
			Data received from server: {initialData.variable}. I can even have
			environment variables: {process.env.ISOMORPH_PUBLIC_ENV_VAR}.
		</>
	);
};

export default PageComponent;

// For server-rendered pages, for static pages, use getStaticProps or skip both of these data fetcher functions.
export const getPropsOnServer = async (context) => {
	console.log(
        context.req,
		context.res,
        context.cookies, // Parsed cookie object for you
        context.env, // Environment variables, would not be exposed to the client.
        context.url // Request url path.
        context.query   // Request query parameters
    );

    const variable = await getVariableFromDatabase(context.url, context.cookies);
    return { variable }; // This will be passed to the page component and can be accessed using the `useInitialData` hook.
};

// For static pages
export const getStaticProps = async (context) => {
    console.log(
        context.env, // Environment variables, would not be exposed to the client.
        context.url // Request url path.
    );
    return { revalidate: 3 * 60, variable: 5 }; // Revalidate the page after 3 minutes, pass the rest of the payload as initial data.
};
```

### Handling Page Meta Data

What's server-side and static rendering without SEO benefits. For that purpose, we have the `getPageMeta` function that will allow you to add all `meta` tags, `link` tags, `script` tags you need.

```javascript
// In your page file.

// src/pages/index.js

...

export const getPageMeta = () => {
	return {
		title: "Home Page",
		meta: [
			{
				name: "description",
				content: "A simple page generated on the server-side.",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1.0",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: "https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css",
			},
		],
		scripts: [
			{
				type: "application/ld+json",
				content: '{ type: "Your JSON LD data for rich results" }',
			},
		],
	};
};
```

### Determining When your page is on the client-side

Components rendered on the client-side are **hydration-error free**, that's because they are not hydrated in the first place, they are **re-rendered**, which means as long as your pages are not super heavy and big, you can avoid worrying about errors like `HTML on server did not match the HTML on client` which can be frustrating and error-prone when writing React apps that render and function on both the client and the server-side without any impact on page load and performance.

To find out whether your app is on the client-side, just use the following:

```javascript
typeof window === "undefined"; // If this is true, you're on the server-side.
```

### Environment Variables

Environment variables are fully supported, use a `.env` file at the root of your folder to expose environment variables for your app. On the server-side and while rendering your page components on the server-side, you have access to all environment variables.

On the client-side, all environment variables starting with `ISOMORPH_PUBLIC_` are automatically exposed.

### Custom Error Pages

For handling custom UIs for 404 and 500 errors, you can create a `pages/_error.js` file.

```javascript
const ErrorComponent = ({ statusCode, error }) => {
	// statusCode -> 404 | 500
	// error -> The error message that was received from the server.
	return (
		<>
			<h4>{statusCode}</h4>
			<br />
			{error}
		</>
	);
};

export default ErrorComponent;
```

### Building and Serving on Production

Use the following command to compile your source code to production config.

```
npm run build
```

Use the following to start the server.

```
npm run start
```

---

This project is still a WIP and will be for the near future, check the [Work In Progress](#work-in-progress) section to see what's still pending.
