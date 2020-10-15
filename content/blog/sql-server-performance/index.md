---
title: SQL Server Performance
date: "2020-10-15T17:05:01.284Z"
description: "How I improved database performance 30x"
---

Recently I deployed a new web application to the cloud. Locally on my machine performance was fine, but once the database was deployed to the cloud the CPU hit 100% and queries were taking far longer than expected (6000ms vs 300ms locally).

The performance was so bad that I had to pull the plug on the system and assess what was going wrong. Users were unable to even login, as their query was sent to the back of the queue and not processed before the request timed out.

The strangest part of it all, was that the queries I ran directly on the database via SQL Server Management Studio were running at similar speeds to my local database.

Thankfully Azure has a fantastic set to tools to provide insight into minute by minute performance, along with query insight tools to see which queries were the most intensive on the system.

What I found was the queries being run from the REST API, were having Implicit Conversion applied, before the query could be run. When a _varchar_ field was being queried, the system was doing a full table scan to match the query data type against the database table data type. When this was happening on the main data table (19 million rows), performance was hit hard.

The fix was as simple as the following, in the API codebase.

From:

```sql
SELECT PARAM_VALUE FROM PARAMETER_VALUES
WHERE PARM_CODE='TAGNAME'
AND OPTN_CODE='A2020';
```

To:

```sql
SELECT PARAM_VALUE FROM PARAMETER_VALUES
WHERE PARM_CODE=CAST('TAGNAME' as varchar(30))
AND OPTN_CODE=CAST('A2020' as varchar(8));
```

After this change was applied throughout the API, the performance difference was massive. Ultimately, it even ended up out-performing my local database instance even with the added latency of a cloud system.

The below code snippet is now what is used to monitor any offending queries on the database to find where we might still be doing some implicit conversion, along with execution count and worker time.

```sql
SELECT TOP(50) DB_NAME(t.[dbid]) AS [Database Name],
t.text AS [Query Text],
qs.total_worker_time AS [Total Worker Time],
qs.total_worker_time/qs.execution_count AS [Avg Worker Time],
qs.max_worker_time AS [Max Worker Time],
qs.total_elapsed_time/qs.execution_count AS [Avg Elapsed Time],
qs.max_elapsed_time AS [Max Elapsed Time],
qs.total_logical_reads/qs.execution_count AS [Avg Logical Reads],
qs.max_logical_reads AS [Max Logical Reads],
qs.execution_count AS [Execution Count],
qs.creation_time AS [Creation Time],
qp.query_plan AS [Query Plan]
FROM sys.dm_exec_query_stats AS qs WITH (NOLOCK)
CROSS APPLY sys.dm_exec_sql_text(plan_handle) AS t
CROSS APPLY sys.dm_exec_query_plan(plan_handle) AS qp
WHERE CAST(query_plan AS NVARCHAR(MAX)) LIKE ('%CONVERT_IMPLICIT%')
 AND t.[dbid] = DB_ID()
 AND qs.creation_time>DATEADD(HOUR,-11,GETDATE()) -- IMPORTANT
ORDER BY qs.total_worker_time DESC OPTION (RECOMPILE);
```

I've found this to be incredibly frustrating that SQL Server requires this _CAST_ function to be applied to get good performance system, as it makes the SQL queries less clean and is an extra thing to check on any new code written to ensure similar issues aren't encountered. This is especially important now we are running a serverless model where we get billed per second based on CPU usage, as Microsoft's error can end up costing the end user.
