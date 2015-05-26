![Interactive K-means](preview.gif)

# Interactive K-means

Visualize and interact with the clustering algorithm k-means.  
Try it at [lettier.com/kmeans](http://www.lettier.com/kmeans/).  
Read more about [k-means](https://lettier.github.io/posts/2016-04-24-k-means-from-scratch.html).

## Download & Run

```bash
git clone https://github.com/lettier/interactivekmeans.git
cd interactivekmeans
nohup python -m http.server &> /dev/null &
python -mwebbrowser http://localhost:8000
```

## Directions

- Lay down data points by clicking the mouse. 
- You can also use the `scatter` button located in the controls. 
- Set your value for `k` and `maxIterations`. 
- Press `runKMeans` to cluster the on-screen data points. 
- Remove data points by clicking on them. 
- Use the silhouette coefficient to find the optimal `k`.

(C) 2015 David Lettier.  
[lettier.com](https://www.lettier.com/)
