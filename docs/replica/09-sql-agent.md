# SQL-Agent：实现SQL生成、翻译

进阶案例拆解 · RAG 与 Schema-Linking

## 实现案例

参考图用 Vanna AI 展示一个链路：用户提出问题，系统检索 DDL／Schemas、说明文档和正确 SQL 示例，将上下文交给模型，生成 SQL，查询数据库，再检查结果。正确案例可在审核后回流检索库；错误查询需要修订。

![SQL-Agent：实现SQL生成、翻译：流程与结构图 1](/agent-diagrams/09-sql-agent-1.png)

## 实现数据SQL-Agent

这里实现一个简单的 SQL 助手。主要目的是 SQL 生成、翻译、优化；参考图中的 DB-GPT 示例选择了一个空 Action，因此生成 SQL 和执行 SQL 是两件不同的事情。

**原图代码摘录（截断）：** 以下保留截图可辨认的类、配置与字段。原图右侧及底部有裁切，因此它不是可直接运行的完整代码；`…` 表示缺失内容，不是 Python 实现。

```text
"""SQL Assistant Agent.
Use RAG and Schema-Linking, which can generate,translate,
and correct SQL based on user questions.
"""

import asyncio
from dbgpt.agent import BlankAction, ConversableAgent, DynConfig, ProfileConf…

class SQLAssistantAgent(ConversableAgent):
    """SQL Agent Use RAG and Schema-Linking."""

    profile: ProfileConfig = ProfileConfig(
        name=DynConfig(
            "kevin",
            category="agent",
            key="dbgpt_agent_expand_sql_expert_name",),
        ),
        role=DynConfig(
            "SQLExpert", category="agent", key="dbgpt_agent_expand_name_role"
        ),
        goal=DynConfig(
            "SQL generation, SQL translate, SQL diagnostics",
            category="agent",
            key="dbgpt_agent_expand_sql_expert_name_goal",
            …
```

原图还展示了 BlankAction、ConversableAgent、ProfileConfig 与 DynConfig 等名称。它们属于截图中的框架版本，补写部分采用可独立理解的输入输出契约。

## 1. 把自然语言问题连接到表结构

问题：“每个城市有多少笔已支付订单？”先提供表名、字段、字段含义、状态枚举和统计口径。Schema-Linking 的任务就是把“城市”“已支付”等业务词连接到正确字段。

```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  city TEXT NOT NULL,
  status TEXT NOT NULL,
  amount_cents INTEGER NOT NULL
);
```

## 2. 生成与翻译

::: tip 提示词契约
根据给定 Schema 和业务口径生成一条只读 SQL。不得猜测不存在的表或字段。条件不清楚时返回需要澄清的问题。输出 SQL、参数、口径说明和依赖字段。
:::

```sql
SELECT city, COUNT(*) AS paid_orders
FROM orders
WHERE status = 'paid'
GROUP BY city
ORDER BY paid_orders DESC;
```

翻译成自然语言：只统计 status 等于 paid 的记录，按 city 分组计算记录数，再按数量降序排列。这里的“订单数”是记录数；如果原表一笔订单有多行明细，应先明确是否需要 COUNT(DISTINCT order_id)。

## 3. 校验与执行

执行前用数据库方言对应的解析器检查语法与语句类型，再用受限只读账户执行。账户权限、查询超时、行数和数据范围由服务端控制，不能只靠检查 SQL 里有没有 DELETE 这个单词。

| 检查项 | 示例错误 | 处理方式 |
| --- | --- | --- |
| 字段存在 | 把 city 写成 province | 返回 schema 错误重新生成 |
| 业务口径 | 已支付是否包含已退款 | 先澄清定义 |
| 数据范围 | 跨租户查询 | 服务端强制授权过滤 |
| 资源限制 | 无限制全表查询 | 超时与扫描限制 |
| 结果正确 | 空结果被解释为零业务 | 说明查询范围与空值含义 |

## 4. 优化与反馈回流

先看执行计划和真实查询成本，再考虑索引、筛选条件或聚合方式。把“问题、Schema 版本、SQL、确认后的结果”作为一条示例保存。未经审核的生成 SQL 不自动变成正确答案。

**练习：** 将问题改成“本月各城市销售额”，列出还缺少哪些信息：时间字段、时区、金额口径、退款规则。能先发现缺失字段，比快速生成一条错误 SQL 更重要。

<!-- source-reference -->

<div class="source-note">内容依据：用户提供的第 10 张参考图。保留其可见结构、概念和案例，截图未显示的步骤为教学补写。原图作者与历史标注见下方对照。</div>

<details><summary>查看参考原图 · 完整保留截图中的图表与可见文字</summary>

![第10张参考原图](/reference-agent/10-原图-配图.webp)

</details>
