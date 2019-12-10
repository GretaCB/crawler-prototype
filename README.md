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

---

# Crawler Prototype

- Node.js
- Express.js
- Redis

Prototyping a web app was an interesting challenge since my recent work the past couple years has been focused more on software development than on web development. I chose server side Javascript and Node.js because it was an opportunity for me to write a Node.js app again, since I’ve been writing Python and C at my current job. Throughout the process, I noticed myself learning new things every step of the way. For example, how to develop a polite and performant web crawler, how to use Redis, and how to Dockerize multiple services together. I had also been wanting to learn ES6 Javascript and newer patterns, like the Promise-based async/await feature, so I used those in this project as well. It was exciting to stretch my web app knowledge again. I look forward to any recommendations you have and hearing how others have approached this project.

## Design

In a perfect world, I knew I wanted the following:
- Web service (API)
- Application service (crawlers)
- Queue
- Datastore
- Cache(s)
- Load Balancer

The **Web service** would handle incoming requests and send jobs to the queue

The **Application service** would have separate workers for crawling and receive jobs from the queue

The **Queue** would distribute work to the crawlers

The **Datastore** would contain a document for each crawl job

The **Cache(s)** would hold page data for URLs previously parsed (not expired) and Robot.txt files. Caching within a crawler is vital due to the immense amount of network I/O.

The **Load Balancer** would route traffic and distribute requests/responses to other parts of the infrastructure, like the application service and the datastore.

And finally this design would be containerized to allow for consistent distribution.

That was the dream. My prototype looks a bit different.

---

Prototyping was an interesting challenge in itself. I understand the pieces needed from the perspective of a larger platform like Amazon Web Services (AWS), but I wasn't too familiar with how to implement this on a local scale.

The prototype:
- Web service (API + Crawlers)
- Datastore
- Cache


The **web service** consists of an Express.js app that forks a separate node child process for crawling. Forking multiple processes took a dark turn when I realized I had to somehow implement process manamgent. Running background processes (forking) is one way to get around Node's single threaded nature, but forking is slow since they are essentially clones of the main process. The option of using Worker Threads using node's Cluster module came to mind, but that would only handle vertical scaling. This wouldn't be a longterm solution for horizontal scaling, which was the goal. So I left the lonely forked process as-is due to time since I wanted to at least get a functioning prototype ready to submit. I'm not 100% sure how I would *prototype* separate crawl workers locally that could scale horizontally. Ideally, the crawlers would be completely separate from the web service in their own application. This separation would also help eliminate single points of failure and would require some sort of load balancer.

The **datastore** is a Redis instance (key/value store). Initially, I envisioned using multiple Redis databases on the same instance (one DB for the crawl job store and one for the request cache). I eventually got this working. However, once I started to containerize that architecture in Docker, it became clear that wouldn't work. I also realized that since I was using different keys for the crawl jobs and for the cache I could just use the same DB for both. This wouldn't work at scale, but for the sake of time, here we are. Learning how to use Redis was where I spent most of my time on this project. If I had more time to learn how to Dockerize multiple redis instances, I would have used Redis for [the queue](https://optimalbits.github.io/bull/) as well.

## How to deploy in production

1. One way is to deploy and scale the web service and the application service separately on their own stacks/cluster.

2. Deploying the application service via serverless Lambda is a slightly different way to deploy that could be perfect for the crawler's recursive nature. Crawling per URL is a short-lived execution, has pretty low CPU usage, and doesn’t use many resources except for network I/O. This would make the application code easy to deploy (no need for configuring a bunch of infrastructure), would likely be cheaper than containerized infrastructure, and Lambda usage would scale down automatically by the cloud provider. 

If using AWS as the cloud provider, I could use DynamoDB as the datastore and use DynamoDB Streams to trigger new Lambda runs. Note: The AWS docs state 
> "the Lambda functions will share the read throughput for the stream they share"

It would be good to verify whether or not this would cause a bottleneck in the crawler's case.

## Future work I think would be interesting

There is so much more I would like to implement for the service if I had the time and know-how, for example more unit tests, better parameter validation and error handling, logging and monitoring, etc.

The most interesting to me would be added toolage and observability:
- Networking optimization: High throughput and low latency is key for a system like the crawler since its heaviest work involves making network requests. This work would entail benchmarking network performance and gaining a better understanding of the operating system's networking stack. I'm  interested in learning more about the network layer in general and digging into tools like [iPerf](https://iperf.fr/iperf-doc.php).
- Added Security: Increase seed url validation and ensure the crawler avoids potentially harmful content.

