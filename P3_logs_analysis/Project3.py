import psycopg2

# query = 'select* from log limit 5;'
# query4 = "SELECT a.time, b.errortotal, a.alltotal, round((b.errortotal::float/a.alltotal::float)::numeric, 4) AS error FROM (SELECT to_char(time, 'YYYY-MM-DD') AS time, count(status) AS errortotal FROM log WHERE status NOT LIKE '200%' GROUP BY to_char(time, 'YYYY-MM-DD')) AS b, (SELECT to_char(time, 'YYYY-MM-DD') AS time, count(*) AS alltotal FROM log GROUP BY to_char(time, 'YYYY-MM-DD')) AS a WHERE a.time = b.time;"


"""
1. What are the most popular three articles of all time?
Which articles have been accessed the most?
Present this information as a sorted list with the most popular article at the top.
"""
query1 = "SELECT articles.title, count(*) as number " \
         "FROM articles JOIN log ON log.path LIKE ('%'||articles.slug||'%') " \
         "GROUP BY articles.title ORDER BY number DESC LIMIT 3;"

"""
2. Who are the most popular article authors of all time?
That is, when you sum up all of the articles each author has written, which authors get the most page views?
Present this as a sorted list with the most popular author at the top.
"""

query2 = "SELECT authors.name, count(*) as number FROM articles, authors, log " \
         "WHERE articles.author = authors.id AND log.path LIKE ('%'||articles.slug||'%') " \
         "GROUP BY authors.name ORDER BY number DESC;"

"""
3. On which days did more than 1% of requests lead to errors?
The log table includes a column status that indicates the HTTP status code that the news site sent to the user's browser.
"""

query3 = "SELECT time, error FROM (" \
         "SELECT a.time, round((b.errortotal::float/a.alltotal::float)::numeric, 4) AS error " \
         "FROM " \
         "(SELECT to_char(time, 'YYYY-MM-DD') AS time, count(status) AS errortotal FROM log WHERE status NOT LIKE '200%' " \
         "GROUP BY to_char(time, 'YYYY-MM-DD')) AS b," \
         "(SELECT to_char(time, 'YYYY-MM-DD') AS time, count(status) AS alltotal FROM log " \
         "GROUP BY to_char(time, 'YYYY-MM-DD')) AS a " \
         "WHERE a.time = b.time) as temp WHERE temp.error >0.01;"

def sqlquery(query):
    conn = psycopg2.connect(database="news")
    cursor = conn.cursor()
    cursor.execute(query)
    results = cursor.fetchall()
    print(results)
    conn.close()

print("Result for problem 1\n")
sqlquery(query1)
print("\nResult for problem 2\n")
sqlquery(query2)
print("\nResult for problem 3\n")
sqlquery(query3)