from django.db import models
from django.utils.text import slugify


class DocCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.CharField(max_length=255, blank=True)
    icon = models.CharField(max_length=50, default="book-open")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = "Doc Categories"
        ordering = ['order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class DocArticle(models.Model):
    category = models.ForeignKey(DocCategory, on_delete=models.CASCADE, related_name='articles')
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    summary = models.CharField(max_length=300)
    content = models.TextField()
    order = models.PositiveIntegerField(default=0)
    version = models.CharField(max_length=20, default="v3.x")
    is_published = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category__order', 'order', 'title']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.category.name}] {self.title}"
