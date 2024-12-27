# Project Concept

Knowledge, as the crystallization of human civilization, should embody its inherent boundlessness and be shared as a public asset for all humanity. However, the current intellectual property (IP)-centric system has, to some extent, constrained the free dissemination and sharing of knowledge by tying its boundless nature to capital interests. By reexamining the essence of knowledge, the value of its producers' labor, and the possibilities offered by societal technologies, we can explore a new path toward the public ownership of knowledge. This article builds on the concept of POIP (Public Ownership of Intellectual Property) and explores how technological and institutional innovation can enable the genuine publicization of knowledge.

### The Essence and Destination of Knowledge: Transcending Capitalist Logic

The essence of knowledge lies in its boundlessness. Unlike material commodities that are consumed when used, knowledge is a public resource that can be amplified through dissemination. Historically, many great ideas, technologies, and cultural achievements have gained immense societal value through free and open sharing. However, when knowledge is subsumed under the logic of capital, its boundlessness is undermined, transforming it into a monopolized resource. The ultimate destination of knowledge should not be capital but the public domain. This respects the intrinsic characteristics of knowledge and aligns with the fundamental principles of social equity.

Under the current intellectual property system, knowledge is often privatized and becomes a tool for capital to extract monopolistic rents. Publishing companies or patent-holder corporations frequently profit far beyond the value of the labor contributed by the original creators—authors, scientists, and artists—who may not receive fair compensation for their contributions. This system fundamentally deviates from the original purpose of knowledge: to serve society as a whole. It also exacerbates inequality in the production and dissemination of knowledge.

### Reshaping Compensation for Knowledge Producers and the System

While critiquing the existing system, we must confront a critical reality: the labor of knowledge producers must be respected and fairly compensated. Producing knowledge requires creativity, time, and effort, making it a kind of labor whose value cannot be overlooked. Any attempt to redefine ownership and dissemination of knowledge must ensure that producers receive rewards proportional to their labor.

However, such rewards do not necessarily have to rely on monopolistic IP rents. Through technological innovation, we can ensure fair compensation for knowledge creators while preserving the equitable dissemination of knowledge. For instance, blockchain technology provides a foundation for the fair distribution of knowledge. Using blockchain, we can create an innovative model for knowledge dissemination and payment: when readers purchase a piece of knowledge, their payment can be fairly distributed among the author and previous consumers. In other words, after the author has received sufficient compensation, the cost of disseminating the knowledge can gradually be distributed among all consumers, ultimately achieving low-cost or even free sharing of knowledge.

### Respecting the Aspirations of Authors and Readers

Reimagining ownership and dissemination of knowledge involves balancing the interests of both creators and consumers. True creators, who cherish their work, likely aspire for their creations to reach a global audience rather than being restricted to a particular capitalist or platform. Intellectual works can only achieve their maximum societal value when they are widely read, appreciated, and disseminated. From the reader's perspective, they would prefer that their payments contribute to the journey toward public access to knowledge rather than merely enriching platforms or monopolistic intermediaries.

Currently, a significant portion of the price of many knowledge products is taken by platforms or intermediaries rather than directly benefiting the creators. This not only dampens consumers' willingness to purchase but also limits the dissemination of knowledge. By reducing or eliminating these intermediary layers through technological and institutional reforms, both authors and readers can ultimately benefit from a system that better serves their interests.

### POIP: A Gentle Attempt at Knowledge Publicization

Against this backdrop, the POIP concept offers a moderate and practical pathway toward the publicization of knowledge. POIP allows authors to maintain their current commercial models while laying a foundation for the publicization of knowledge by setting an unattainable sales goal (goal count). Specifically, authors can choose to continue charging for their works until a certain sales goal is achieved, at which point the work enters the public domain. This design respects the author's autonomy while providing a mechanism for the eventual publicization of knowledge.

More importantly, POIP is not merely an adjustment to a commercial model; it carries broader societal significance. It seeks to promote a new principle: not only should knowledge ultimately be publicized, but profits should also eventually serve the public good. In this framework, the collective effort of society ensures that the value of knowledge can be shared more broadly, rather than being monopolized by a few capital interests.

### The Radical Implications of POIP and Future Exploration

POIP's approach points to an even more radical idea: reimagining the organization of knowledge in a communist society. Not only should knowledge be publicized, but profits should also be collectively owned—directly challenging the foundational logic of capitalism. True elimination of exploitation and a transition to a communist organizational model can only occur through the publicization of profits. POIP is merely the first step in this direction; the road ahead is long and arduous.

### The POIP Contract for Public Ownership of Intellectual Property

POIP is based on blockchain technology, with its core implemented as a smart contract called the "Buyout Compensation Publicization Contract." This contract has undergone two iterations, from simple to more nuanced designs. Understanding the evolution of this contract offers a clear insight into the underlying principles of POIP. The iterations are as follows:

#### Buyout Cap Contract (Limited Buyout Contract)

Initially, the knowledge producer privately owns the intellectual property. They specify a maximum earnings cap (Max) and set a per-unit price for the product (Price). The number of required sales (Count) is then calculated as:

$$
Count = \frac{Max}{Price}
$$

The producer sells the product in the market. As sales progress and the actual number of sales approaches **Count**, the producer relinquishes their private ownership of the intellectual property, publicizing it for free use by everyone.

While the Buyout Cap Contract is simple and easy to implement, publicizing the intellectual property may lead to dissatisfaction among buyers, as they may prefer to wait until the product becomes free rather than paying upfront for access. To address this issue, several potential remedies can be implemented:

1. Issuing honors or recognition to early buyers.
2. Highlighting the time advantage for early buyers by delaying the publicization of the IP after reaching **Count**.
3. Adopting the following "Buyout Compensation Contract."

#### Buyout Compensation Contract

Initially, the knowledge producer privately owns the intellectual property. They specify a maximum earnings cap (Max) and set a per-unit price for the product (Price). The number of required sales (Count) is calculated as:

$$
Count = \frac{Max}{Price}
$$

The producer begins selling the product. As sales progress and the actual number of sales approaches **Count**, the producer does not immediately relinquish private ownership of the intellectual property. Subsequent purchasers of the product contribute their payments to a shared compensation pool, which is evenly redistributed to all previous buyers (including the new purchaser). Over time, the cost of accessing the product decreases for all buyers, approaching near-zero. At the same time, earlier buyers are fairly compensated, ensuring equitable payment for everyone. This effectively results in the practical publicization of the intellectual property.

To implement the redistribution of funds, the contract maintains the following records:

1. The balance of the contract account (separate from the producer's account, as this balance is used for compensating buyers; the producer cannot withdraw from it).
2. A list of buyers and the total number of buyers.
3. The amount of compensation already withdrawn by each buyer.
4. The maximum earnings cap (Max) and product price (Price).

When a new buyer purchases access to the product, they are added to the buyer list, increasing the total buyer count. The funds they contribute are added to the contract's account balance. When an existing buyer requests compensation, the contract calculates their compensation amount based on the formula:

$$
Amount = Price - \frac{Max}{BuyerCount}
$$

The contract determines the buyer's eligible compensation by subtracting the amount they have already withdrawn from the current eligible compensation. After processing the withdrawal, the buyer's total withdrawn amount is updated accordingly.

To lower the barrier for new buyers, the contract can allow for immediate compensation adjustment at the time of purchase. New buyers would only need to pay the difference between the per-unit price and their current eligible compensation to access the product. After completing the purchase, their total withdrawn compensation is updated to reflect the current eligible amount.

While the Buyout Compensation Contract ensures gradual publicization of usage rights, the ownership of the intellectual property formally remains private. To further promote the publicization of knowledge, a "Buyout Compensation Publicization Contract" can be adopted.

#### Buyout Compensation Publicization Contract

Initially, the knowledge producer privately owns the intellectual property. They specify a maximum earnings cap (Max) and set a per-unit price for the product (Price). The required number of sales (Count) is calculated as:

$$
Count = \frac{Max}{Price}
$$

Additionally, the producer specifies a maximum compensation limit (**MaxCompensation**), which ideally approaches but does not exceed **Price**. As sales progress, buyers are added, and their compensation gradually increases. When the compensation for each buyer reaches **MaxCompensation**, the producer relinquishes ownership of the intellectual property, and the product becomes publicly owned.

The total number of buyers required to reach **MaxCompensation** can be calculated as:

$$
MaxBuyerCount = \frac{Max}{Price - MaxCompensation}
$$

By continuously tracking the total number of buyers, the contract ensures knowledge products are ultimately publicized when the total buyer count reaches **MaxBuyerCount**. 

This iterative framework bridges the gap between individual compensation and collective ownership, providing a practical pathway toward the publicization of knowledge.