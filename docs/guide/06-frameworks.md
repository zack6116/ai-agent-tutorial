# 工作流与框架：把能力连接成一个应用

[翻阅本章手绘知识卡](/courses/ai-agent.html?chapter=06-frameworks)

第 06 章 · 方案选型与编排 · 建议先理解工具调用与 RAG

查订单、检索政策和生成回答都能单独运行后，下一步是决定：它们按什么顺序执行？失败后去哪？什么时候需要停下来等用户确认？这就是编排要解决的问题。

::: tip 选框架之前，先画流程
<mark>先写清输入、输出、分支和停止条件，再选择实现工具。</mark> 同一条业务流程可以用可视化平台，也可以用代码实现。
:::

::: info 本章交付物
一张能解释正常、缺信息、工具失败和人工审批四条路径的流程图。再选一种熟悉的实现方式，跑通其中一条完整路径。
:::

## 先选模式：五种常用的工作流组织方式

下面把 [Anthropic 总结的五种工作流模式](https://www.anthropic.com/engineering/building-effective-agents)转成任务设计速查。它们可以组合使用，不代表 Agent 只有五种设计。

| 模式 | 步骤怎么组织 | 练习场景 | 重点检查 |
| :--- | :--- | :--- | :--- |
| 串联 | 上一步结果交给下一步 | 提取反馈 → 归类 → 写摘要 | 中间结果格式是否正确 |
| 路由 | 按问题类型进入不同分支 | 查物流 / 查政策 / 转人工 | 分错类时能否纠正 |
| 并行 | 独立子任务同时做，最后汇总 | 分别核对型号、价格和售后信息 | 一路失败是否影响整体 |
| 协调者与执行者 | 根据任务动态分工，再合并结果 | 按问题拆分资料调研 | 子任务边界与重复工作 |
| 评估与改进 | 先生成，再按标准检查和修改 | 按评分表修订说明文档 | 评估标准与最大修改次数 |

::: info 套用到订单助手
先用路由区分“查物流”和“查政策”，再把“查询 → 组织答复”串联起来。只有当任务路径确实需要动态变化时，再引入自主循环。
:::

---

## 6.1 编排框架的核心价值（4步教学法）

### 6.1.1 【是什么（Concept）】
如果说大语言模型（LLM）是计算机的 **CPU**，那么**Agent 编排框架（Orchestration Framework）就是操作系统的任务调度器（Task Scheduler / Process Manager）**。

编排框架的核心使命，是将离散的大模型调用、向量数据库检索、业务 API 请求、用户交互确认按照严格或自适应的拓扑逻辑（DAG 有向无环图或 StateGraph 状态图）连接起来，并在各个执行节点之间安全、有序地传递结构化上下文状态（State）。

| 框架类别 | 代表技术 | 学习曲线 | 适用角色 | 核心优势 |
| :--- | :--- | :--- | :--- | :--- |
| **低代码/可视化平台** | **Dify**, Coze, FastGPT | ⭐（极低） | 业务专家、产品经理、全栈开发 | 开箱即用、可视化画布、内置知识库与插件 |
| **代码级状态图框架** | **LangGraph**, LlamaIndex Workflows | ⭐⭐⭐（中等） | Python/AI 工程师、后端架构师 | 状态持久化、环状循环、分支重试、细粒度控制 |
| **高并发服务级框架** | **Eino (字节跳动)** | ⭐⭐⭐⭐（较高） | Go 语言服务端专家、架构师 | 静态类型安全、零反射极致性能、生产级中间件 |

---

### 6.1.2 【为什么需要它（Why）】
许多初学者习惯在 Python 脚本中用简单的 `if...else` 或 `while` 循环串联大模型 API。但在真实商业生产中，这种“裸奔代码”会迅速遭遇以下四大致命瓶颈：
1. **状态污染与丢失（State Drift）**：多轮对话和工具交互中，上下文变量随处散落，难以实现时间旅行（Time Travel）和会话断点恢复。
2. **缺乏环路与自愈能力（No Looping Control）**：早期线性链（如 LangChain 早期 SequentialChain）只支持从左向右的单向流，一旦中间工具执行报错，无法优雅回退或重新规划。
3. **高并发与内存泄漏**：缺乏统一的会话持久化层（Checkpointer），海量用户并发接入时导致进程阻塞或内存崩溃。
4. **无法实现人机协同（Human-in-the-loop）**：对于退款、发货、删库等危险操作，裸写代码极难做到“执行到某节点暂停等待人工审批，审批通过后原地恢复运行”。

---

### 6.1.3 【能做什么（What）】
利用成熟的编排框架，企业可以构建出高稳定、可观测的复杂自动化业务流：
- **电商多技能客服中心**：自动识别用户意图，流转至售前导购、物流查询或售后退款分支。
- **自动化代码研发助手**：生成代码 → 静态检查 → 单元测试 → 失败自动反馈 LLM 修复 → 成功后提 PR。
- **金融风控与投资研报生成**：多智能体协作（收集宏观数据、财报解析、舆情监控），汇总后由主审 Agent 交叉校验。

---

## 6.2 零代码/低代码工业基座：Dify 全流程搭建实战

Dify 提供可视化的应用编排、知识库与工具接入能力。下面按“准备知识 → 接入工具 → 连接节点 → 测试”的顺序理解搭建过程，具体菜单名称可能随版本变化。

```mermaid
flowchart TD
    subgraph DifyPlatform[Dify 核心引擎体系]
        KB[1. 知识库模块 Dataset\n多格式解析 / 混合检索 / 重排打分]
        Tools[2. 工具与插件市场 Tools\n内置 Google/高德/天气 + 自定义 OpenAPI]
        Workflow[3. 工作流画布 Workflow\n条件分支 / 代码节点 / 迭代 / 模板转换]
        Monitor[4. 运营与监控 Logs\n用户反馈标注 / Token 统计 / Trace 追踪]
    end

    App[对外交付产品形态]
    Workflow --> App
    KB --> Workflow
    Tools --> Workflow
    App --> WebUI[Web 独立聊天页]
    App --> API[RESTful API 嵌入现有系统]
    App --> ThirdParty[飞书 / 钉钉 / 微信服务号]


```

### 6.2.1 手把手搭建电商客服 Agent 实操步骤

```mermaid
flowchart LR
    StartNode([用户开始对话]) --> FilterNode[敏感词与反作弊节点]
    FilterNode --> ClassifierNode{Dify 意图分类器节点}
    
    ClassifierNode -- 售后政策咨询 --> KBNode["知识库检索节点\n(混合检索 + BGE Rerank)"]
    ClassifierNode -- 物流订单查询 --> ToolNode["自定义 HTTP 工具节点\n(调用外部 ERP 查询)"]
    ClassifierNode -- 闲聊与打招呼 --> DirectNode[LLM 快速问答节点]
    
    KBNode --> FormatNode["LLM 组装综合节点\n(注入语气约束与规范)"]
    ToolNode --> FormatNode
    DirectNode --> EndNode([输出渲染卡片 / 微信终端])
    FormatNode --> EndNode


```

1. **第一步：创建企业级知识库**
   - 进入 Dify 控制台，点击顶部【知识库】 → 【创建知识库】。
   - 上传企业售后政策与常见问题文档（支持 txt、markdown、pdf、docx）。
   - **分段与清洗设置**：选择“自动”或“通用分块”，分块长度建议 500~800 字符。
   - **索引方式**：务必勾选【高质量】（调用外部 Embedding 模型），推荐选用 `text-embedding-3-small` 或 `bge-large-zh-v1.5`。
   - **检索设置**：选择【混合检索】，并在重排序模型处配置 `bge-reranker-large`，将相似度阈值设定为 `0.60`。
2. **第二步：挂载自定义业务工具**
   - 进入【工具】页面，点击【创建自定义工具】。
   - 导入你的 ERP 订单查询 OpenAPI 规范（Swagger JSON），Dify 会自动解析出入参定义。
3. **第三步：创建 Chatflow 并发布**
   - 进入【工作室】，创建【Chatflow（对话工作流）】。
   - 在开始节点后连接【意图分类器】节点，分流至“知识库检索”或“工具调用”。
   - 测试无误后点击右上角【发布】，一键获取嵌入式 Web 组件脚本或 OpenAPI 访问密钥。

---

## 6.3 代码级工业标准：LangGraph 状态图架构与实操

当流程需要分支、循环与中断恢复时，可以用 LangGraph 的状态图表达。读图时先看节点执行什么，再看条件边如何决定下一步。

```mermaid
flowchart TD
    Start([__start__]) --> AgentNode[Agent 核心决策节点\n分析意图并输出动作]
    AgentNode --> RouteCondition{是否触发工具?}
    RouteCondition -- 是 --> HumanCheck{执行前是否需要审批?}
    HumanCheck -- 需人工审批 --> Pause([挂起等待人工确认])
    HumanCheck -- 已授权 --> ToolNode[Tool 执行节点\n执行并写入结果]
    Pause -- 批准 --> ToolNode
    Pause -- 拒绝 --> End
    ToolNode --> AgentNode
    RouteCondition -- 否 --> End([__end__ 流程终止])


```

### 6.3.1 核心架构三要素

```mermaid
flowchart LR
    subgraph Checkpointer[LangGraph Checkpointer 会话持久化与时间旅行]
        direction TB
        State0[Step 0 初始状态快照] --> State1[Step 1 决策快照]
        State1 --> State2[Step 2 工具调用前快照]
        State2 --> State3[Step 3 异常发生 / 人工挂起]
        State3 -.->|Time Travel 支持任意回滚| State1
    end
    
    Checkpointer --> Redis[("Postgres / Redis 持久化存储")]


```

1. **State（全局状态载荷）**：整个图流转时共享的数据模型。LangGraph 使用类型注解（如 `Annotated[list, operator.add]`）指定 Reducer，实现消息的自动增量合并。
2. **Nodes（节点）**：普通的 Python 函数或可调用对象，入参为当前 `State`，返回值是一个字典，用来更新 `State`。
3. **Edges（边与条件边）**：
   - 普通边（Edge）：确定性的前驱到后继直接跳转。
   - 条件边（Conditional Edge）：根据前序节点输出的 `State`，动态计算下一个目的节点。

### 6.3.2 独立可运行源码（对应 `src/06_langgraph_workflow.py`）
教程源码目录配套了完整的开箱即跑脚本，包含：
- **状态流转 Reducer**
- **LLM 意图决策节点**
- **工具调用与敏感操作拦截**
- **Human-in-the-Loop 人机审批流**

运行测试命令：
```bash
python src/06_langgraph_workflow.py
```

终端执行日志展示：
```text
🚀 [StateGraph 启动] 入口节点: 'agent'
---> [Step 1] 进入节点: 【agent】
     [AgentNode] 决策: 需要调用高风险工具 'issue_refund'
---> [Step 2] 进入节点: 【tools】
⚠️ [Human-in-the-Loop 拦截] 检测到高风险操作，图状态暂停，等待人工审批...
[管理员操作]: 审核通过！批准退款
[继续图流转]: 【退款系统返回】订单 ORD-2026-8899 成功退款 299.0 元。
```

---

## 6.4 字节跳动高并发开源框架：Eino

在互联网大厂的核心服务端，Go 语言以其极高的并发性能和内存友好性占据统治地位。**Eino** 是字节跳动专门为大模型应用与智能体系统打造的高性能 Go 框架。

```mermaid
flowchart LR
    subgraph EinoCore[字节跳动 Eino 核心架构]
        direction TB
        Types[强类型接口协议\nModel / Tool / Retriever]
        Graph[静态编译 DAG 图\n零反射 / 纳秒级跳转]
        Middleware[高可用中间件\n熔断降级 / 令牌桶限流 / OpenTelemetry]
    end
    Request[高并发 API 请求] --> EinoCore --> Response[亚秒级低延迟响应]


```

### 核心特性
- **强类型与全链路解耦**：将 Model、Prompt、Tool、Retriever 全部抽象为 Go 强类型接口，编译期排查一切类型错误。
- **可视化编排与静态编译**：支持在 IDE 中直接将 DAG 图编译为高效的静态 Go 代码，运行期零反射开销。
- **开箱即用的高可用组件**：内置熔断降级（Circuit Breaker）、并发限流器（Rate Limiter）、分布式分布式链路追踪（OpenTelemetry）。

---

## 6.5 经典开源自主 Agent 架构解密

行业早期涌现了多款里程碑式的开源 Agent 项目，研读其源码机制能极大地开拓架构视野：

```mermaid
classDiagram
    class AutoGPT {
        +GoalBasedWorkflow
        +ShellExecutor
        +FileIOController
        +execute_multi_objective()
    }
    class BabyAGI {
        +TaskList
        +TaskCreationAgent
        +PrioritizationAgent
        +ExecutionAgent
        +run_loop()
    }
    class SuperAGI {
        +AgentConfig
        +MemoryManager
        +ToolRegistrar
        +IterationController
        +run()
    }


```

### 1. AutoGPT：多目标复杂任务的自动化引擎
- **工作机制**：结合网络搜索、大语言模型调用、文件读写与本地 Python/Shell 脚本执行。
- **Trigger Prompt 范式**：通过结构化的系统提示词强制模型输出当前思考（Thoughts）、推理（Reasoning）、行动计划（Plan）与命令（Command）。

### 2. BabyAGI：任务驱动的自驱循环

```mermaid
flowchart TD
    TaskQueue[("待办任务优先级队列 Task List")]
    
    subgraph ExecutionLoop[BabyAGI 三 Agent 自主协同循环]
        Agent1[1. Execution Agent\n取出队列顶部首个任务并调用 LLM 执行]
        Agent2[2. Task Creation Agent\n基于执行结果与终极目标，分析衍生新子任务]
        Agent3[3. Prioritization Agent\n对扩充后的任务队列重新评估优先级并重排]
    end

    TaskQueue -->|弹出最高优先级任务| Agent1
    Agent1 -->|传递执行上下文| Agent2
    Agent2 -->|注入新任务候选集| Agent3
    Agent3 -->|写回重新排序的待办列表| TaskQueue


```

- **三大核心协同 Agent**：
  1. **Execution Agent（执行 Agent）**：负责完成当前待办队列顶部的具体子任务；
  2. **Task Creation Agent（任务创建 Agent）**：根据已执行任务的结果和总目标，思考是否需要动态生成新任务；
  3. **Prioritization Agent（优先级排序 Agent）**：重新对待办任务队列进行重要性与紧急程度排期。

### 3. SuperAGI：工业级 Agent 的约束机制
- **约束清单（Constraints）与迭代上限（Max Iterations）**：
  在生产部署中，必须对自主智能体施加硬性边界限制（如 `max_iterations=10`、`constraints=["严禁对生产库执行写操作"]`），这是防止智能体在生产环境中陷入死循环或发生破坏性行为的核心工程底线。

---

## 6.6 生产踩坑排查 FAQ

> **Q1: 为什么我的 LangGraph 在循环反思时陷入了死循环？**  
> **A**: 根因通常是状态未发生实质性变化或缺少**最大迭代步数熔断器**。必须在状态字典中引入 `step_count`，并在条件边函数中添加保护机制：`if state["step_count"] >= 5: return END`。

> **Q2: 企业选型时，应该选 Dify 还是 LangGraph？**  
> **A**: 
> - 如果业务逻辑以“文档检索问答 + 外部标准化 API 调用”为主，且需要业务人员参与调优 Prompt，**首选 Dify**；
> - 如果业务逻辑存在深层状态依赖、需要复杂的环状重试、状态回滚与私有化精细控制，**首选 LangGraph**；
> - 若属于超大规模高并发后端微服务，**推荐选用 Go 语言的 Eino**。

---

## 6.7 课后动手实战与思考题（Lab）

::: tip 验收：审批必须在执行之前
让一条请求在审批节点暂停，检查外部写操作尚未发生；拒绝后应直接结束，批准后才执行。框架里存在“审批节点”，并不自动说明顺序正确。
:::

1. **动手练习**：运行 `python src/06_langgraph_workflow.py`，尝试在 `AVAILABLE_TOOLS` 中新增一个 `query_express_trajectory(tracking_no)` 物流轨迹查询工具，并在状态图中新增对应的路由分支。
2. **架构思考**：如果某个工具调用返回了超时（504 Gateway Timeout），你会在 LangGraph 中设计怎样的重试节点和退避（Backoff）策略？
