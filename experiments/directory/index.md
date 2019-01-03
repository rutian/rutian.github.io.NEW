---
---

<!-- Directory for the bloggish posts --> 

<div class="ui center aligned container">

<h4 class="ui horizontal divider header"> Shorter Projects and Experiments</h4>

<div class="ui list">
  {% for post in site.posts %}
  <a class="item" href="{{ post.url }}">{{ post.title }},  {{post.date | date: "%B %Y" }} </a>
  {% endfor %}
</div>


</div>
