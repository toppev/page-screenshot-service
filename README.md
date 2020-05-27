# page-screenshot-service
Takes a screenshot of the given page using puppeteer.


Example request body
```
{
    "url": "https://www.example.com/",
    "quality": 10,
    "device": "iPhone X"
}
```

Service port defaults to 3005 if `PORT` environment variable is not set.

Optionally set `TOKEN` environment variable to deny all requests without matching "token" property in the request body.