# crawler-netlify

Crawl the web :spider:

## Install & Run

You will need both [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) and [Docker](https://docs.docker.com/docker-for-mac/install/) installed locally in order to run this application. Once git and Docker are installed and this repo cloned...

Build and run the redis and app Docker containers:
```
docker-compose up -d
```
(the `-d` flag will start up the containers in the background)


The crawler is now ready to use :tada: Head over to `http://localhost:9000` in your browser.

To stop running the containers
```
docker-compose down
```

If you'd like to make changes to the crawler and try them out, rebuild and run the containers:
```
docker-compose up --build
```

## Test

If you'd like to run the app's unit tests, you can do so from the local directory of the crawler:
```
npm test
```

## Crawler API

### POST a new crawl job

    curl -X POST -H "Content-Type:application/json" http://localhost:9000 -d '{"seedurl":"http://example.com", "levels": 2}'

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
      "Unique URLs Crawled":8
    }

### GET results of an existing job

    curl http://localhost:9000/result/{jobid}

Returns JSON of URLs crawled and count:

    { 
      "https://github.com/gretacb":2,
      "https://linkedin.com/in/carol-hansen-0b553315/":2,
      "https://www.sram.com/en/sram":2,
      "https://www.mapbox.com/":2,
      "https://www.gatsbyjs.org":2,
      "https://www.netlify.com/":2,
      "https://www.instagram.com/sirbruceleroy/":2
    }
