# https://cytoscape.org/cytoscape.js-spread/
# https://materializecss.com/icons.html

import os

import pandas as pd
from fastapi import FastAPI, Response
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.mount("/css", StaticFiles(directory="docs/css"), name="css")
app.mount("/img", StaticFiles(directory="docs/img"), name="css")
app.mount("/js", StaticFiles(directory="docs/js"), name="css")


@app.get("/")
def root():
    with open(os.path.join("docs", "index.html")) as fh:
        data = fh.read()
    return Response(content=data, media_type="text/html")


@app.get("/data/all_tools_graph_final.json")
def reactions():
    content = open('data/all_tools_graph_final.json', 'r').read()

    return Response(content=content, media_type="application/json")
