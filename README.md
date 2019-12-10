# crawler-netlify

Crawl the web :spider:

## Install & Run

You will need both [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) (to clone the repo) and [Docker](https://docs.docker.com/docker-for-mac/install/) (to run the app and redis in containers) installed locally in order to run this application.

Build and run containers:
```
docker-compose up -d
```
(The `-d` flag will start up the containers in the background. This builds and runs a separate container for the crawler app and a separate container for the redis database.)


The crawler is now ready to use :tada: Head over to `http://localhost:9000` in your browser.

**To stop running the containers**

```
docker-compose down
```
**Make changes to the crawler**

If you'd like to make changes to the crawler and try them out, rebuild and run the containers:
```
docker-compose up --build
```

## API

To give the crawler a whirl...

### POST a new crawl job

    curl -X POST -H "Content-Type:application/json" http://localhost:9000 -d '{"seedurl":"http://example.com", "levels": 2}'

- `seedurl`: You can specify the url where the crawler will start.
- `levels`: You can specify how many levels of recursion the crawler will crawl

Returns JSON doc of the new job:

    {
      "id":"2e07fb5e-0615-46f3-aace-0297ed946123",
      "seedurl":"http://carolbhansen.com",
      "levels":2,
      "status":"pending",
      "urls":{}
    }

### GET status of an existing job

    curl http://localhost:9000/status/{jobid}

Returns JSON of job status and number of unique URLs crawled so far:

    {
      "status":"complete",
      "unique urls crawled":8
    }

### GET results of an existing job

    curl http://localhost:9000/result/{jobid}

Returns JSON of URLs crawled and count:

    { 
      "https://github.com/gretacb":2,
      "https://www.sram.com/en/sram":2,
      "https://www.mapbox.com/":2,
      "https://www.gatsbyjs.org":2,
      "https://www.netlify.com/":2
    }
