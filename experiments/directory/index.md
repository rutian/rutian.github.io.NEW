---
---

<!-- Directory for the bloggish posts --> 

<div class="ui center aligned container">

<h2 class="ui horizontal divider header"> Shorter Projects and Experiments</h2>

<div class="ui list">
  {% for post in site.posts %}
  <a class="item" href="{{ post.url }}">{{ post.title }},  {{post.date | date: "%B %Y" }} </a>
  {% endfor %}
</div>


</div>


<script>
$( document ).ready(function() {
  $(".kevinExperiment").addClass( "active" );
});
</script>


