# 基于Agent的智能客服项目

进阶案例拆解 · 原图标题含“已交付”，本页复刻其技术结构，不将其认领为本项目交付业绩

## 1. 智能客服Agent技术架构概览

### 1.1 整体架构设计

智能客服 Agent 的技术架构需要考虑多个层面的协同工作，从用户交互到后端处理，每个环节都至关重要。

![基于Agent的智能客服项目：流程与结构图 1](/agent-diagrams/06-customer-service-1.png)

图 1：智能客服 Agent 整体架构流程图。

这个架构图展示了从用户输入到系统响应的完整流程。预处理模块负责文本清洗和标准化，意图识别和实体抽取并行处理用户输入，对话管理根据当前状态决定后续处理路径。图中简单查询和澄清分支补写了具体动作，使其能够闭合。

### 1.2 核心组件详解

在实际实现中，每个组件都有其特定的技术选型和优化策略：

```python
# 架构示意：组件通过构造函数传入，具体实现由业务决定。
class CustomerServiceAgent:
    def __init__(self, preprocessor, intent_classifier, entity_extractor,
                 dialogue_manager, answer_generator):
        self.preprocessor = preprocessor
        self.intent_classifier = intent_classifier
        self.entity_extractor = entity_extractor
        self.dialogue_manager = dialogue_manager
        self.answer_generator = answer_generator

    def handle(self, user_text, session):
        text = self.preprocessor(user_text)
        intent = self.intent_classifier(text)
        entities = self.entity_extractor(text)
        result = self.dialogue_manager(intent, entities, session)
        return self.answer_generator(result)
```

原图只展示构造函数开头。本段补齐依赖注入与调用关系，属于架构示意，不冒充可直接上线的完整客服服务。

## 2. 对话状态如何管理？

用户说“我想退货”时，系统至少需要订单、原因和商品状态。把已确认字段存入会话状态；下一轮只追问缺少的字段，不重新开始问一遍。

| 状态 | 已知信息 | 下一步 |
| --- | --- | --- |
| 待识别 | 用户原话 | 区分咨询、查单、退货等意图 |
| 待澄清 | 有意图，缺订单号 | 追问订单号 |
| 待查询 | 订单号齐全 | 查订单与适用政策 |
| 待确认 | 有处理建议 | 展示建议和依据 |
| 待人工 | 涉及例外或敏感操作 | 移交完整上下文 |
| 已结束 | 已回答或已接管 | 保存结束原因 |

## 3. RAG 与业务工具分别做什么？

RAG 用来查找政策、说明和操作文档；业务工具用来查询某笔订单的实时状态。不能用知识库中的一般发货规则代替某个订单的真实物流记录。

::: tip 一条有依据的回复
“订单 DEMO-001 的状态为已发货（订单工具返回）。根据当前售后政策第 2 条，签收后符合条件可申请退货。你可以先说明商品状态，我再帮你核对条件。”
:::

## 4. 后处理、反馈与学习更新

回复前检查订单号是否误露、政策引用是否存在、是否把建议误写成已执行。记录用户是否解决问题，并给人工客服查看任务轨迹的入口。

学习更新需要审核：将失败案例整理到测试集，确认知识条目正确后更新。不能把用户随口说的一句话直接变成所有客服共享的政策。

## 5. 项目验收

用正常查单、无订单号、订单不存在、政策冲突、工具超时、转人工六类用例验证。分别统计任务完成率、人工接管原因、引用正确率和响应耗时，保存分母和时间范围，便于后续比较。

<!-- source-reference -->

<div class="source-note">内容依据：用户提供的第 7 张参考图。保留其可见结构、概念和案例，截图未显示的步骤为教学补写。原图作者与历史标注见下方对照。</div>

<details><summary>查看参考原图 · 完整保留截图中的图表与可见文字</summary>

![第7张参考原图](/reference-agent/07-原图-配图.webp)

</details>
