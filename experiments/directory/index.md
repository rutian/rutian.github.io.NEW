---
---

<!-- Directory for the bloggish posts --> 

<div class="ui center aligned container">

<h3 class="ui horizontal divider header"> Shorter Projects and Experiments</h3>

<div class="ui list">
  {% for post in site.posts %}
  <a class="item" href="{{ post.url }}">{{ post.title }},  {{post.date | date: "%B %Y" }} </a>
  {% endfor %}
</div>


</div>
